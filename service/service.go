// Code generated by protoc-gen-gomeet-service. DO NOT EDIT.
// source: pb/www.proto
// Package service provides gRPC/HTTP service registration
package service

import (
	"context"

	"github.com/auth0/go-jwt-middleware"
	"github.com/fullstorydev/grpchan"
	"github.com/gorilla/mux"
	"github.com/grpc-ecosystem/grpc-gateway/runtime"
	"github.com/prometheus/client_golang/prometheus"
	log "github.com/sirupsen/logrus"
	"google.golang.org/grpc"

	pb "github.com/hugdubois/ah-svc-www/pb"
)

var (
	name    = "ah-svc-www" // injected with -ldflags in Makefile
	version = "latest"     // injected with -ldflags in Makefile
)

// Service is the echo
type Service struct {
	Name           string             `json:"name"`
	Version        string             `json:"version"`
	httpController *wwwHTTPController `json:"-"`
	serverImpl     pb.WwwServer       `json:"-"`
}

// NewService return new ah-svc-www service
func NewService(opts ...string) *Service {
	ver := version
	if len(opts) > 0 {
		ver = opts[0]
	}
	return &Service{
		Name:    name,
		Version: ver,
	}
}

func (svc Service) GetServerImpl() pb.WwwServer { return svc.serverImpl }

// RegisterGRPCServices register all grpc services in reg
func (svc *Service) RegisterGRPCServices(
	reg grpchan.ServiceRegistry,
	inProcessChannel grpchan.Channel,
	jwtSecret string,
	caCert string,
	cert string,
	privKey string,
	// EXTRA : param
	sqliteDSN string,
	// END EXTRA : param
	// SUB-SERVICES DEFINITION : param-address
	// svc{{SubServiceNamePascalCase}}Address string,
	// END SUB-SERVICES DEFINITION : param-address
) {
	log.WithFields(log.Fields{
		"jwtSecret": jwtSecret,
		"caCert":    caCert,
		"cert":      cert,
		"privKey":   privKey,
		// EXTRA : log
		"sqliteDSN": sqliteDSN,
		// END EXTRA : log
		// SUB-SERVICES DEFINITION : log-address
		// "svc{{SubServiceNamePascalCase}}Address": svc{{SubServiceNamePascalCase}}Address,
		// END SUB-SERVICES DEFINITION : log-address
	}).Debug("ah-svc-www: RegisterGRPCServices")
	svc.serverImpl = &wwwServer{
		version:             svc.Version,
		subServicesRegistry: reg,
		inProcessChannel:    inProcessChannel,
		jwtSecret:           jwtSecret,
		caCertificate:       caCert,
		certificate:         cert,
		privateKey:          privKey,
		// EXTRA : register server
		sqliteDataSourceName: sqliteDSN,
		// END EXTRA : register server
		// SUB-SERVICES DEFINITION : register-address-to-server
		// svc{{SubServiceNamePascalCase}}Address: svc{{SubServiceNamePascalCase}}Address,
		// END SUB-SERVICES DEFINITION : register-address-to-server
	}
	pb.RegisterHandlerWww(reg, svc.serverImpl)
}

// RegisterHTTPServices register all http services
func (svc *Service) RegisterHTTPServices(
	ctx context.Context,
	mux *mux.Router, addr string,
	opts []grpc.DialOption,
	jwtMiddleware *jwtmiddleware.JWTMiddleware,
) {
	svc.httpController = &wwwHTTPController{
		version:       svc.Version,
		jwtMiddleware: jwtMiddleware,
	}

	svc.httpController.RegisterRoutes(mux)

	// get server mux
	gwmux := runtime.NewServeMux()
	err := pb.RegisterWwwHandlerFromEndpoint(ctx, gwmux, addr, opts)
	if err != nil {
		log.Fatalf("RegisterGRPCGateway error : %s\n", err)
	}

	// prometheus instrument handler
	instrf := prometheus.InstrumentHandlerFunc
	// swagger doc handler
	mux.
		PathPrefix("/api/v1/swagger.json").
		Handler(instrf("Api.Swagger", svc.httpController.Swagger))

	// it's not necessary to use secure middleware for gRPC calls it's already secured
	// api gateway handlers with metrics instrumentations
	routeMap := map[string]string{
		"/api/v1/services/status": "Api.ServicesStatus",
		"/api/v1/echo":            "Api.Echo",
		"/api/v1/version":         "Api.Version",
	}
	for route, label := range routeMap {
		mux.PathPrefix(route).Handler(instrf(label, gwmux.ServeHTTP))
	}

	// prometheus metrics handler
	mux.
		Handle("/metrics", prometheus.Handler())
}
