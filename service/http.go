package service

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	jwtmiddleware "github.com/auth0/go-jwt-middleware"
	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus"
	log "github.com/sirupsen/logrus"

	pb "github.com/hugdubois/ah-svc-www/pb"
)

type wwwHTTPController struct {
	version       string                       `json:"version"`
	jwtMiddleware *jwtmiddleware.JWTMiddleware `json:"-"`
}

func (s wwwHTTPController) RegisterRoutes(mux *mux.Router) {
	// prometheus instrument handler
	instrf := prometheus.InstrumentHandlerFunc

	// HTTP/1.1 routes
	// status handler
	mux.HandleFunc("/status", instrf("Http.Status", s.Status))
	mux.HandleFunc("/version", instrf("Http.Version", s.Version))
	mux.HandleFunc("/", instrf("Http.Root", s.Root))

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

func (s wwwHTTPController) Root(w http.ResponseWriter, r *http.Request) {
	log.Info("wwwHTTPController.Root")
	fmt.Fprintf(w, "%s-%s OK", name, s.version)
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
