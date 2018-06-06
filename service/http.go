package service

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"path"
	"strings"

	jwtmiddleware "github.com/auth0/go-jwt-middleware"
	assetfs "github.com/elazarl/go-bindata-assetfs"
	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus"
	log "github.com/sirupsen/logrus"

	pb "github.com/hugdubois/ah-svc-www/pb"
	ui "github.com/hugdubois/ah-svc-www/ui"
)

type wwwHTTPController struct {
	version       string                       `json:"version"`
	jwtMiddleware *jwtmiddleware.JWTMiddleware `json:"-"`
	uiFileServer  http.Handler                 `json:"-"`
	uiFs          *assetfs.AssetFS             `json:"-"`
}

func (s *wwwHTTPController) RegisterRoutes(mux *mux.Router) {
	// prometheus instrument handler
	instrf := prometheus.InstrumentHandlerFunc
	s.initUiFS()
	// HTTP/1.1 routes
	// status handler
	mux.HandleFunc("/status", instrf("Http.Status", s.Status))
	mux.HandleFunc("/version", instrf("Http.Version", s.Version))
	mux.HandleFunc("/404", instrf("Http.NotFoundPage", s.NotFound))
	mux.PathPrefix("/").Handler(instrf("Http.Root", s.Root))

	// to declare an authenticated handler do something like this
	// if s.jwtMiddleware == nil {
	//   mux.
	//     PathPrefix("/<URL>").
	//     Handler(instrf("<METRICS_KEY>", s.<HTTP_HANDLER>))
	// } else {
	//   mux.
	//     PathPrefix("/<URL>").
	//     Handler(negroni.New(
	//       negroni.HandlerFunc(jwtMiddleware.HandlerWithNext),
	//       negroni.Wrap(instrf("<METRICS_KEY>", s.<HTTP_HANDLER>)),
	//     ))
	// }
}

func (s *wwwHTTPController) initUiFS() {
	s.uiFs = &assetfs.AssetFS{
		Asset:     ui.Asset,
		AssetDir:  ui.AssetDir,
		AssetInfo: ui.AssetInfo,
		Prefix:    "assets",
	}
	s.uiFileServer = http.FileServer(s.uiFs)
}

func (s wwwHTTPController) NotFound(w http.ResponseWriter, r *http.Request) {
	log.Infof("wwwHTTPController.NotFound: %s", r.URL.Path)
	contents, err := s.uiFs.Asset(path.Join(s.uiFs.Prefix, "404.html"))
	if err != nil {
		http.Error(w, "Page not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "text/html")
	w.WriteHeader(http.StatusNotFound)
	w.Write(contents)
	return
}

func (s wwwHTTPController) Root(w http.ResponseWriter, r *http.Request) {
	log.Infof("wwwHTTPController.Root: %s", r.URL.Path)
	if strings.TrimPrefix(r.URL.Path, "/") == "" {
		contents, err := s.uiFs.Asset(path.Join(s.uiFs.Prefix, "index.html"))
		if err != nil {
			log.Errorf("page not found error %s", err.Error())
			s.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "text/html")
		w.Write(contents)
		return
	}
	_, err := s.uiFs.AssetInfo(path.Join(s.uiFs.Prefix, r.URL.Path))
	if err != nil {
		log.Errorf("page not found error %s", err.Error())
		s.NotFound(w, r)
		return
	}
	s.uiFileServer.ServeHTTP(w, r)
}

func (s wwwHTTPController) Status(w http.ResponseWriter, r *http.Request) {
	log.Info("wwwHTTPController.Status")
	fmt.Fprintf(w, "OK")
}

func (s wwwHTTPController) Swagger(w http.ResponseWriter, r *http.Request) {
	log.Info("wwwHTTPController.Swagger")
	w.Header().Set("Content-Type", "application/json")
	io.Copy(w, strings.NewReader(pb.Swagger))
}

func (s wwwHTTPController) Version(w http.ResponseWriter, r *http.Request) {
	log.Info("wwwHTTPController.Version")
	v := pb.VersionResponse{
		Name:    name,
		Version: s.version,
	}
	output, err := json.Marshal(v)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(output)
}
