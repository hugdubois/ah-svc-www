# ah-svc-www usage

## Basic usage

- Run server

```shell
ah-svc-www serve --address <server-address>

# serve gRPC and HTTP multiplexed on localhost:3000
ah-svc-www serve --address localhost:3000

# serve gRPC on localhost:3000 and HTTP on localhost:3001
ah-svc-www serve --grpc-address localhost:3000 --http-address localhost:3001

# more info
ah-svc-www help serve
```

- Run cli client

  ```shell
  $ ah-svc-www cli version
  $ ah-svc-www cli services_status
  $ ah-svc-www cli rsvp_creation <names [string]> <email [string]> <presence [bool]> <children_name_age [string]> <housing [bool]> <music [string]> <brunch [bool]>
  $ ah-svc-www cli --address localhost:42000 version

  # more info
  ah-svc-www help cli
  ```

- Run console client

```shell
$ ah-svc-www console --address=localhost:3000
INFO[0000] ah-svc-www console  Exit=exit HistoryFile="/tmp/ah-svc-www-62852.tmp" Interrupt="^C"
└─┤ah-svc-www-0.1.8+dev@localhost:13000├─$ help
INFO[0002] HELP :

	┌─ version
	└─ call version service

	┌─ services_status
	└─ call services_status service

	┌─ rsvp_creation <names [string]> <email [string]> <presence [bool]> <children_name_age [string]> <housing [bool]> <music [string]> <brunch [bool]>
	└─ call rsvp_creation service

	┌─ service_address
	└─ return service address

	┌─ jwt [<token>]
	└─ display current jwt or save none if it's set

	┌─ console_version
	└─ return console version

	┌─ tls_config
	└─ display TLS client configuration

	┌─ help
	└─ display this help

	┌─ exit
	└─ exit the console


└─┤ah-svc-www-0.1.8+dev@localhost:13000├─$ unknow
WARN[0003] Bad arguments : "unknow" unknow
└─┤ah-svc-www-0.1.8+dev@localhost:13000├─$ exit
```

- HTTP/1.1 usage (with curl):

  ```shell
  $ curl -X GET    http://localhost:13000/api/v1/version
  $ curl -X GET    http://localhost:13000/api/v1/services/status
  $ curl -X POST   http://localhost:13000/api/v1/rsvp_creation -d '{"names": "<string>", "email": "<string>", "presence": <boolean>, "children_name_age": "<string>", "housing": <boolean>, "music": "<string>", "brunch": <boolean>}'
  $ curl -X GET    http://localhost:13000/
  $ curl -X GET    http://localhost:13000/version
  $ curl -X GET    http://localhost:13000/metrics
  $ curl -X GET    http://localhost:13000/status
  $ curl -X GET    http://localhost:42000/version
  ```

- Get help

```shell
ah-svc-www help

# or get help directly for a command
ah-svc-www help <command[serve|cli|console]>
```

## Tests

- Use make directive

```shell
make test
```

- Unit tests

```shell
cd service
go test
```

- Functional tests (with an embedded server)

```shell
ah-svc-www functest -e
```

- Load tests

```shell
ah-svc-www loadtest --address <multiplexed server address> -n <number of sessions> -s <concurrency level>
```

## Mutual TLS authentication

- Create a Certificate Authority:

```shell
hack/gen-ca.sh hugdubois_ca
ls data/certs
```

- Create two key pairs with the common name "localhost":

```shell
hack/gen-cert.sh server hugdubois_ca
./gencert.sh client hugdubois_ca
ls data/certs
```

- Run the server with its TLS credentials:

```shell
ah-svc-www serve \
    --address localhost:3000 \
    --ca data/certs/hugdubois_ca.crt \
    --cert data/certs/server.crt \
    --key data/certs/server.key
```

- Run the clients with their TLS credentials:

```shell
ah-svc-www cli <grpc_service> <params...> \
    --address localhost:3000 \
    --ca data/certs/hugdubois_ca.crt \
    --cert data/certs/client.crt \
    --key data/certs/client.key

ah-svc-www console \
    --address localhost:3000 \
    --ca data/certs/hugdubois_ca.crt \
    --cert data/certs/client.crt \
    --key data/certs/client.key
```

## JSON Web Token support

JSON Web Token validation can be enabled on the server by providing a secret key:

```shell
ah-svc-www serve --jwt-secret foobar
```

The token subcommand is used to generate a JWT from the secret key:

```shell
ah-svc-www token --secret-key foobar
```

Then the cli and console subcommands can use the generated token for authentication against the JWT-enabled server:

```shell
ah-svc-www cli --jwt <generated token> <grpc_service> <params...>
ah-svc-www console --jwt <generated token>
```

JWT validation can be tested on the HTTP/1.1 endpoints by providing the bearer token in the "Authorization" HTTP header:

```shell
TOKEN=`ah-svc-www token --secret-key foobar`
curl -H "Authorization: Bearer $TOKEN" -X <HTTP_VERB> http://localhost:13000/api/v1/<grpc_service> -d '<HTTP_REQUEST_BODY json format>'
```


