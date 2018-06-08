# ah-svc-www docker usage

## Build docker image

### Regular Dockerfile

```shell
make docker
--or--
docker build -t hugdubois/ah-svc-www:$(cat VERSION | tr +- __) .
```

## Use port binding on host

### 1. Launch server container

```shell
docker run -d \
    --net=network-grpc-hugdubois \
    -p 13000:13000 \
    --name=svc-ah-svc-www-1 \
    -it hugdubois/ah-svc-www:$(cat VERSION | tr +- __)
```

### 2. Use client on host

- Build and use cli tool

  ```shell
  $ make
  $ cd _build
  $ ah-svc-www cli version
  $ ah-svc-www cli services_status
  $ ah-svc-www cli rsvp_creation <names [string]> <email [string]> <presence [bool]> <children_name_age [string]> <housing [bool]> <music [string]> <brunch [bool]>
  $ ah-svc-www cli --address localhost:42000 version

  # more info
  ah-svc-www help cli
  ```

- Or use HTTP/1.1 api

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

## Do not use port binding

### 1. Create a docker's network

```shell
docker network create \
    --driver bridge network-grpc-hugdubois &> /dev/null
```

### 2. Run server container with the previous created network

```shell
docker run -d \
    --net=network-grpc-hugdubois \
    --name=svc-ah-svc-www \
    -it hugdubois/ah-svc-www:$(cat VERSION | tr +- __)
```

### 3. Run clients with docker

#### Console

```shell
docker run -d \
    --net=network-grpc-hugdubois \
    --name=console-ah-svc-www \
    -it hugdubois/ah-svc-www:$(cat VERSION | tr +- __) console --address=svc-ah-svc-www:13000
```

Detach console with `Ctrl + p Ctrl + q` and attach with :

```shell
docker attach console-ah-svc-www
```

#### Client with docker

```shell
docker run \
    --net=network-grpc-hugdubois \
    -it hugdubois/ah-svc-www:$(cat VERSION | tr +- __) cli --address=svc-ah-svc-www:13000 <grpc_service> <params...>
```

#### Curl with docker use gomeet/gomeet-curl

[Docker Hub](https://hub.docker.com/r/gomeet/gomeet-curl/) - [Source](https://github.com/gomeet/gomeet-curl)

```shell
# use HTTP/1.1 api
docker run \
    --net=network-grpc-hugdubois \
    -it gomeet/gomeet-curl -X POST http://svc:13000/api/v1/-X <HTTP_VERB> http://localhost:13000/api/v1/<grpc_service> -d '<HTTP_REQUEST_BODY json format>'

# status and metrics
docker run \
    --net=network-grpc-hugdubois \
    -it gomeet/gomeet-curl http://svc-ah-svc-www:13000/status

docker run \
    --net=network-grpc-hugdubois \
    -it gomeet/gomeet-curl http://svc-ah-svc-www:13000/metrics
```
