// Code generated by protoc-gen-gomeet-service. DO NOT EDIT.
// source: pb/www.proto
package cmd

import (
	"fmt"
	"os"

	homedir "github.com/mitchellh/go-homedir"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	"github.com/hugdubois/ah-svc-www/service"
)

var (
	cfgFile           string
	caCertificate     string
	serverCertificate string
	serverPrivateKey  string
	clientCertificate string
	clientPrivateKey  string
	timeoutSeconds    int
	jwtToken          string
	svc               = service.NewService()
	svcName           = fmt.Sprintf("%s-%s", svc.Name, svc.Version)

	// rootCmd This represents the base command when called without any subcommands
	rootCmd = &cobra.Command{
		Use:   "ah-svc-www",
		Short: "Hugdubois's www microservice",
		Long: `To get started run the serve subcommand which will start a server:

  $ ah-svc-www serve
  $ ah-svc-www serve -p 42000

Then you can hit it with the client:
  $ ah-svc-www cli version
  $ ah-svc-www cli services_status
  $ ah-svc-www cli rsvp_creation <names [string]> <email [string]> <presence [bool]> <children_name_age [string]> <housing [bool]> <music [string]> <brunch [bool]>
  $ ah-svc-www cli --address localhost:42000 version

Or over HTTP/1.1 with curl:
  $ curl -X GET    http://localhost:13000/api/v1/version
  $ curl -X GET    http://localhost:13000/api/v1/services/status
  $ curl -X POST   http://localhost:13000/api/v1/rsvp_creation -d '{"names": "<string>", "email": "<string>", "presence": <boolean>, "children_name_age": "<string>", "housing": <boolean>, "music": "<string>", "brunch": <boolean>}'
  $ curl -X GET    http://localhost:13000/
  $ curl -X GET    http://localhost:13000/version
  $ curl -X GET    http://localhost:13000/metrics
  $ curl -X GET    http://localhost:13000/status
  $ curl -X GET    http://localhost:42000/version

Or via an interactive console :

  $ ah-svc-www console
  $ ah-svc-www console --address localhost:42000

`,
		// Uncomment the following line if your bare application
		// has an action associated with it:
		//	Run: func(cmd *cobra.Command, args []string) { },
	}
)

// Execute adds all child commands to the root command sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(-1)
	}
}

func init() {
	cobra.OnInitialize(initConfig)

	// Here you will define your flags and configuration settings.
	// Cobra supports Persistent Flags, which, if defined here,
	// will be global for your application.
	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.ah-svc-www.yaml)")

	// Cobra also supports local flags, which will only run
	// when this action is called directly.
	// rootCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}

// initConfig reads in config file and ENV variables if set.
func initConfig() {
	if cfgFile != "" {
		// Use config file from the flag.
		viper.SetConfigFile(cfgFile)
	} else {
		// Find home directory.
		home, err := homedir.Dir()
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

		// Search config in home directory with name ".toto" (without extension).
		viper.AddConfigPath(home)
		viper.SetConfigName(".ah-svc-www")
	}

	viper.AutomaticEnv() // read in environment variables that match

	// If a config file is found, read it in.
	if err := viper.ReadInConfig(); err == nil {
		fmt.Println("Using config file:", viper.ConfigFileUsed())
	}
}
