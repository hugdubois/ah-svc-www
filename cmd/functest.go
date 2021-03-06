// Code generated by protoc-gen-gomeet-service. DO NOT EDIT.
// source: pb/www.proto
package cmd

import (
	"fmt"
	"net"
	"os"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/cobra"

	"github.com/gomeet/gomeet/utils/jwt"

	"github.com/hugdubois/ah-svc-www/cmd/functest"
	"github.com/hugdubois/ah-svc-www/models"
	"github.com/hugdubois/ah-svc-www/server"
)

var (
	useEmbeddedServer     bool
	useRandomPort         bool
	sqliteFunctestMigrate bool

	// funcTestCmd represents the functest command
	funcTestCmd = &cobra.Command{
		Use:   "functest",
		Short: "Runs functional tests on the service",
		Run: func(cmd *cobra.Command, args []string) {
			runFunctionalTests()
		},
	}
)

func init() {
	rootCmd.AddCommand(funcTestCmd)

	// force debug mode
	funcTestCmd.PersistentFlags().BoolVarP(&debugMode, "debug", "d", false, "Force debug mode")

	// address flag (to serve all protocols on a single port)
	funcTestCmd.PersistentFlags().StringVarP(&serverAddress, "address", "a", "localhost:13000", "Multiplexed gRPC/HTTP server address")

	// gRPC address flag (to serve gRPC on a separate address)
	funcTestCmd.PersistentFlags().StringVar(&grpcServerAddress, "grpc-address", "", "gRPC server address")

	// HTTP/1.1 address flag (to serve HTTP on a separate address)
	funcTestCmd.PersistentFlags().StringVar(&httpServerAddress, "http-address", "", "HTTP server address")

	// CA certificate
	funcTestCmd.PersistentFlags().StringVar(&caCertificate, "ca", "", "X.509 certificate of the Certificate Authority (required for gRPC TLS support)")

	// gRPC client certificate
	funcTestCmd.PersistentFlags().StringVar(&serverCertificate, "cert", "", "X.509 certificate (required for gRPC TLS support)")

	// gRPC client private key
	funcTestCmd.PersistentFlags().StringVar(&serverPrivateKey, "key", "", "RSA private key (required for gRPC TLS support)")

	// JSON Web Token
	funcTestCmd.PersistentFlags().StringVar(&jwtToken, "jwt", "", "JSON Web Token (external server only)")

	// JWT secret signing key
	funcTestCmd.PersistentFlags().StringVar(&jwtSecret, "jwt-secret", "", "JSON Web Token secret signing key (embedded server only)")

	// request timeout
	funcTestCmd.PersistentFlags().IntVar(&timeoutSeconds, "timeout", 5, "Request timeout in seconds")

	// embedded server flag
	funcTestCmd.PersistentFlags().BoolVarP(&useEmbeddedServer, "embed-server", "e", false, "Embed the server to test")

	// random port server flag
	funcTestCmd.PersistentFlags().BoolVar(&useRandomPort, "random-port", false, "Use a random port for the embedded server")

	// cors flag
	funcTestCmd.PersistentFlags().StringVarP(&corsAllowedOrigins, "cors", "c", "*", "Cross Origin Resource Sharing AllowedOrigins (string) separed by | ex: http://*gomeet.com|http://*example.com")

	// Sqlite data migration on start
	funcTestCmd.PersistentFlags().BoolVar(&sqliteFunctestMigrate, "sqlite-migrate", false, "Sqlite data migration on start")
	// Sqlite data source name: http://gorm.io/database.html#connecting-to-a-database
	funcTestCmd.PersistentFlags().StringVar(&sqliteDataSourceName, "sqlite-dsn", "", "Sqlite data source file")

}

// getFreePort asks the kernel for a free open port that is ready to use.
func getFreePort() (int, error) {
	addr, err := net.ResolveTCPAddr("tcp", "localhost:0")
	if err != nil {
		return 0, err
	}

	l, err := net.ListenTCP("tcp", addr)
	if err != nil {
		return 0, err
	}
	defer l.Close()
	return l.Addr().(*net.TCPAddr).Port, nil
}

func runFunctionalTests() {
	if useEmbeddedServer {
		if debugMode {
			log.SetLevel(log.DebugLevel)
		} else {
			// by default for embedded server only panic are logged
			log.SetLevel(log.PanicLevel)
		}
		if useRandomPort {
			freePort, err := getFreePort()
			if err == nil {
				serverAddress = fmt.Sprintf("localhost:%d", freePort)
				grpcServerAddress = ""
				httpServerAddress = ""
			}
		}
		go func() {
			var ok bool
			if grpcServerAddress != "" && httpServerAddress != "" {
				ok = server.OnMultipleAddresses(
					grpcServerAddress, httpServerAddress,
					corsAllowedOrigins,
					caCertificate, serverCertificate, serverPrivateKey, jwtSecret,
					sqliteDataSourceName)
			} else {
				ok = server.OnSingleAddress(
					serverAddress,
					corsAllowedOrigins,
					caCertificate, serverCertificate, serverPrivateKey, jwtSecret,
					sqliteDataSourceName)
			}
			if !ok {
				log.Errorf("AhSvcWww starting failure: grpcServerAddress: %s, httpServerAddress: %s\n", grpcServerAddress, httpServerAddress)
			}
		}()
	}

	// if the embedded server is JWT-enabled, test clients require a valid token
	if useEmbeddedServer && jwtSecret != "" {
		var err error
		jwtToken, err = jwt.Create(
			"github.com/gomeet/gomeet",
			jwtSecret,
			tokenLifetimeHours,
			subjectID,
			jwt.Claims{},
		)

		if err != nil {
			fmt.Printf("failed to create JWT : %v\n", err)
			os.Exit(1)
		}
	}

	// initialize the sqlite database schema
	if sqliteDataSourceName != "" && sqliteFunctestMigrate {
		sqliteDSN := sqliteDataSourceName

		sqliteDB, err := gorm.Open("sqlite3", sqliteDSN)
		if err != nil {
			fmt.Printf("Database connection error (DSN \"%s\"): %v\n", sqliteDSN, err)
			os.Exit(1)
		}
		// ping the sqlite database server
		err = sqliteDB.DB().Ping()
		if err != nil {
			fmt.Printf("Ping database connection error (DSN \"%s\"): %v\n", sqliteDSN, err)
			os.Exit(1)
		}
		err = models.MigrateSchema(sqliteDataSourceName)

		if err != nil {
			fmt.Printf("Sqlite schema migration error: %s\n", err)
			os.Exit(1)
		}
	}

	testConfig := functest.FunctionalTestConfig{
		ServerAddress:     serverAddress,
		GrpcServerAddress: grpcServerAddress,
		HttpServerAddress: httpServerAddress,
		CaCertificate:     caCertificate,
		ClientCertificate: serverCertificate,
		ClientPrivateKey:  serverPrivateKey,
		TimeoutSeconds:    timeoutSeconds,
		JsonWebToken:      jwtToken,

		//extra parameters

		SqliteDataSourceName: sqliteDataSourceName,
	}

	failures := runFunctionalTestSession(testConfig)

	if len(failures) == 0 {
		fmt.Println("PASS")
		fmt.Println("ok\tfunctest is ok")

		os.Exit(0)
	} else {
		fmt.Printf("Test failures:\n")
		for idx, failure := range failures {
			fmt.Printf("%d) %s: %s\n", idx+1, failure.Procedure, failure.Message)
		}

		os.Exit(1)
	}
}

func appendFailures(acc []functest.TestFailure, newSlice []functest.TestFailure) []functest.TestFailure {
	for _, failure := range newSlice {
		acc = append(acc, failure)
	}

	return acc
}

func runFunctionalTestSession(config functest.FunctionalTestConfig) []functest.TestFailure {
	var failures []functest.TestFailure

	// gRPC services test
	failures = appendFailures(failures, functest.TestVersion(config))
	failures = appendFailures(failures, functest.TestHttpVersion(config))
	failures = appendFailures(failures, functest.TestServicesStatus(config))
	failures = appendFailures(failures, functest.TestHttpServicesStatus(config))
	failures = appendFailures(failures, functest.TestRsvpCreation(config))
	failures = appendFailures(failures, functest.TestHttpRsvpCreation(config))
	// Extra http handler
	failures = appendFailures(failures, functest.TestHttpStatus(config))
	failures = appendFailures(failures, functest.TestHttpMetrics(config))
	failures = appendFailures(failures, functest.TestHttpSwagger(config))

	return failures
}
