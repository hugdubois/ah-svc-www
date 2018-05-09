// Code generated by protoc-gen-gomeet-service. DO NOT EDIT.
// source: pb/www.proto
package server

import (
	"crypto/tls"
	"crypto/x509"
	"io/ioutil"
	"net"
	"net/http"
	"strings"

	"github.com/auth0/go-jwt-middleware"
	"github.com/cockroachdb/cmux"
	"github.com/dgrijalva/jwt-go"
	"github.com/fullstorydev/grpchan"
	"github.com/fullstorydev/grpchan/inprocgrpc"
	"github.com/gorilla/mux"
	grpc_prometheus "github.com/grpc-ecosystem/go-grpc-prometheus"
	nlog "github.com/meatballhat/negroni-logrus"
	"github.com/rs/cors"
	log "github.com/sirupsen/logrus"
	"github.com/urfave/negroni"
	"golang.org/x/net/context"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"

	gomeetService "github.com/gomeet/gomeet/utils/service"

	"github.com/hugdubois/ah-svc-www/service"
)

func grpcServer(
	caCert string, serverCert string, serverKey string, jwtKey string,
	sqliteDSN string) *grpc.Server {
	var grpcS *grpc.Server

	sInterceptors, uInterceptors := gomeetService.Interceptors()
	uMdl := grpc.UnaryInterceptor(uInterceptors)
	sMdl := grpc.StreamInterceptor(sInterceptors)

	if caCert != "" && serverCert != "" && serverKey != "" {
		// load the server's key pair
		serverKeyPair, err := tls.LoadX509KeyPair(serverCert, serverKey)
		if err != nil {
			log.Fatalf("failed to load gateway key pair: %v", err)
		}

		// create a certificate pool from the CA
		certPool := x509.NewCertPool()
		ca, err := ioutil.ReadFile(caCert)
		if err != nil {
			log.Fatalf("failed to read CA certificate: %v", err)
		}
		if ok := certPool.AppendCertsFromPEM(ca); !ok {
			log.Fatalf("failed to build certificate pool")
		}

		// set up the TLS credentials
		serverCredentials := credentials.NewTLS(&tls.Config{
			ClientAuth:   tls.RequireAndVerifyClientCert,
			Certificates: []tls.Certificate{serverKeyPair},
			ClientCAs:    certPool,
		})

		grpcS = grpc.NewServer(grpc.Creds(serverCredentials), sMdl, uMdl)
	} else {
		grpcS = grpc.NewServer(sMdl, uMdl)
	}

	svc := service.NewService()
	inProcessChannel := new(inprocgrpc.Channel)

	//Real server
	mainHandlers := grpchan.HandlerMap{}
	svc.RegisterGRPCServices(
		mainHandlers, inProcessChannel,
		jwtKey, caCert, serverCert, serverKey,
		sqliteDSN,
	)
	grpc_prometheus.Register(grpcS)

	mainHandlers.ForEach(grpcS.RegisterService)

	return grpcS
}

func httpServer(
	httpServerAddr string, grpcServerAddr string,
	corsAllowedOrigins string,
	ctx context.Context, caCert string, gatewayCert string, gatewayKey string, jwtKey string,
) *http.Server {
	// create the HTTP request router
	h := mux.NewRouter()

	// register the gRPC gateway
	var opts []grpc.DialOption
	if caCert != "" && gatewayCert != "" && gatewayKey != "" {
		// load the gateway's key pair
		gatewayKeyPair, err := tls.LoadX509KeyPair(gatewayCert, gatewayKey)
		if err != nil {
			log.Fatalf("failed to load client key pair: %v", err)
		}

		// create a certificate pool from the CA
		certPool := x509.NewCertPool()
		ca, err := ioutil.ReadFile(caCert)
		if err != nil {
			log.Fatalf("failed to read CA certificate: %v", err)
		}
		if ok := certPool.AppendCertsFromPEM(ca); !ok {
			log.Fatalf("failed to build certificate pool")
		}

		// set up the TLS credentials
		serverHost, _, err := net.SplitHostPort(grpcServerAddr)
		if err != nil {
			log.Fatalf("failed to parse server hostname in %s: %v", grpcServerAddr, err)
		}
		if serverHost == "" {
			serverHost = "localhost"
		}
		gatewayCredentials := credentials.NewTLS(&tls.Config{
			ServerName:   serverHost,
			Certificates: []tls.Certificate{gatewayKeyPair},
			RootCAs:      certPool,
		})

		opts = []grpc.DialOption{grpc.WithTransportCredentials(gatewayCredentials)}
	} else {
		opts = []grpc.DialOption{grpc.WithInsecure()}
	}

	// register other HTTP handlers
	svc := service.NewService()
	if jwtKey != "" {
		// setup the JWT authentication middleware
		jwtMiddleware := jwtmiddleware.New(jwtmiddleware.Options{
			ValidationKeyGetter: func(token *jwt.Token) (interface{}, error) {
				return []byte(jwtKey), nil
			},
			SigningMethod: jwt.SigningMethodHS256,
		})

		svc.RegisterHTTPServices(ctx, h, grpcServerAddr, opts, jwtMiddleware)
	} else {
		svc.RegisterHTTPServices(ctx, h, grpcServerAddr, opts, nil)
	}

	// setup the negroni middleware for request logging
	n := negroni.New(
		// no crash with 500
		negroni.NewRecovery(),
		// global logrus logger
		nlog.NewMiddlewareFromLogger(log.StandardLogger(), "ah-svc-www"),
	)

	// CORS support
	if corsAllowedOrigins != "" {
		log.Infof("HTTP with Cross Origin Resource Sharing, AllowedOrigins: %s", corsAllowedOrigins)
		n.Use(cors.New(cors.Options{
			AllowedOrigins: strings.Split(corsAllowedOrigins, "|"),
		}))
	}

	n.UseHandler(h)

	return &http.Server{Handler: n}
}

func OnMultipleAddresses(
	grpcAddr string, httpAddr string,
	corsAllowedOrigins string,
	caCert string, serverCert string, serverKey string, jwtKey string,
	sqliteDSN string) (ok bool) {
	// create the gRPC listener
	grpcL, err := net.Listen("tcp", grpcAddr)
	if err != nil {
		log.Fatal(err)
	}
	// create the HTTP listener
	httpL, err := net.Listen("tcp", httpAddr)
	if err != nil {
		log.Fatal(err)
	}

	// create the gRPC server
	grpcS := grpcServer(
		caCert, serverCert, serverKey, jwtKey,
		sqliteDSN,
	)

	// create the HTTP/1.1 server (we reuse the gRPC server's key pair for the gRPC gateway client)
	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()
	httpS := httpServer(httpAddr, grpcAddr, corsAllowedOrigins, ctx, caCert, serverCert, serverKey, jwtKey)

	// HTTPS support
	if caCert != "" && serverCert != "" && serverKey != "" {
		// load the server's key pair
		serverKeyPair, err := tls.LoadX509KeyPair(serverCert, serverKey)
		if err != nil {
			log.Fatalf("failed to load HTTPS server key pair: %v", err)
		}

		tlsConfig := &tls.Config{
			Certificates: []tls.Certificate{serverKeyPair},
			ClientAuth:   tls.NoClientCert,
		}

		httpsL := tls.NewListener(httpL, tlsConfig)
		httpL = httpsL
	}

	// collect on this channel the exits of each protocol's .Serve() call
	eps := make(chan error, 2)
	// start the listeners for each protocol
	go func() { eps <- grpcS.Serve(grpcL) }()
	go func() { eps <- httpS.Serve(httpL) }()

	grpcSecurity := "insecure"
	if caCert != "" && serverCert != "" && serverKey != "" {
		grpcSecurity = "secure"
	}
	jwtSupport := "disabled"
	if jwtKey != "" {
		jwtSupport = "enabled"
	}
	log.Infof("serving %s gRPC on %s and %s HTTP/1.1 on %s (JWT %s)", grpcSecurity, grpcAddr, grpcSecurity, httpAddr, jwtSupport)

	// handle listener errors
	ok = true
	i := 0
	for err := range eps {
		if err != nil {
			log.Errorf("protocol serve error: %v", err)
			ok = false
		}
		i++
		if i == cap(eps) {
			close(eps)
			break
		}
	}

	return ok
}

func OnSingleAddress(
	addr string,
	corsAllowedOrigins string,
	caCert string, serverCert string, serverKey string, jwtKey string,
	sqliteDSN string) (ok bool) {
	// listen on the specified address
	l, err := net.Listen("tcp", addr)
	if err != nil {
		log.Fatal(err)
	}

	// create the cmux object that will multiplex 2 protocols on the same port
	m := cmux.New(l)
	// match HTTP/1.1 requests and gRPC requests
	httpL := m.Match(cmux.HTTP1())
	grpcL := m.Match(cmux.Any())

	// create the gRPC server
	grpcS := grpcServer(
		caCert, serverCert, serverKey, jwtKey,
		sqliteDSN,
	)

	// create the HTTP/1.1 server (we reuse the gRPC server's key pair for the gRPC gateway client)
	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()
	httpS := httpServer(addr, addr, corsAllowedOrigins, ctx, caCert, serverCert, serverKey, jwtKey)

	// collect on this channel the exits of each protocol's .Serve() call
	eps := make(chan error, 2)
	// start the listeners for each protocol
	go func() { eps <- grpcS.Serve(grpcL) }()
	go func() { eps <- httpS.Serve(httpL) }()

	grpcSecurity := "insecure"
	if caCert != "" && serverCert != "" && serverKey != "" {
		grpcSecurity = "secure"
	}
	jwtSupport := "disabled"
	if jwtKey != "" {
		jwtSupport = "enabled"
	}
	log.Infof("serving on %s (multiplexed, %s gRPC, JWT %s)", addr, grpcSecurity, jwtSupport)
	err = m.Serve()

	// the rest of the code handles exit errors of the muxes
	ok = true
	i := 0
	for err := range eps {
		if err != nil {
			log.Errorf("protocol serve error: %v", err)
			ok = false
		}
		i++
		if i == cap(eps) {
			close(eps)
			break
		}
	}

	return ok
}
