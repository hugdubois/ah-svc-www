DEBUG_TEST?=0
USE_GOGO?=1
DEFAULT_PREFIXES=ah-svc-,gomeet-svc-,svc-
SVC_PREFIX=ah-svc-
NAME = $(SVC_PREFIX)www
GO_PACKAGE_BASE = github.com/hugdubois
GOMEET_GO_PACKAGE_NAME = github.com/gomeet/gomeet
GO_PACKAGE_NAME = $(GO_PACKAGE_BASE)/$(NAME)
GO_PROTO_PACKAGE_ALIAS = pb
GO_PROTO_PACKAGE = $(GO_PACKAGE_NAME)/$(GO_PROTO_PACKAGE_ALIAS)
GO_CGO_ENABLED?=1
VERSION = $(shell cat VERSION)

OS_NAME=$(shell go env GOOS)
OS_ARCH=$(shell go env GOARCH)

# <flag-name-kebab-case>@<type [string|int]>|<description ...>|<default value ...>
# ex: my-extra-flag@string|My extra flag description|my default value,my-extra-flag2@int|My extra flag2 description|5
# eg. no comma, no semicolon or no colon
EXTRA_SERVE_FLAGS=

DB_TYPES=sqlite

# <sub-services-go-package>[version@<default: 0.0.1+dev>][db_types@<mysql,sqlite,.... comma separed>][<flag-name-kebab-case>@<type [string|int]>|<description ...>|<default value ...>]...
# ex: github.com/my-project/prj-svc-aaa[version@0.0.1+dev][db_types@mysql][my-extra-flag@string|My extra flag description|my default value][my-extra-flag2@int|My extra flag2 description|5],github.com/my-project/prj-svc-bbb[sub_services@github.com/my-project/prj-svc-aaa|github.com/my-project/prj-svc-ccc][db_types@mysql]
SUB_SERVICES=

DOCKER_TAG = $(shell cat VERSION | tr +- __)
DOCKER_IMAGE_NAME = hugdubois/$(NAME)
DOCKER_REGISTRY?=docker.io
DOCKER_NETWORK = network-grpc-hugdubois
DOCKER_SVC_CONTAINER = svc-$(NAME)
DOCKER_CONSOLE_CONTAINER = console-$(NAME)



DOCKER_ENV_HUGDUBOIS_JWT_SECRET?=KWJx86/dOuDsNWW6vMYhi0jElZP0fs6S/38e8T8pCCY=
DOCKER_ENV_AH_SVC_WWW_SQLITE_DB_FILE?=ah_svc_www.sqlite3.db





TEST_ENV_HUGDUBOIS_JWT_SECRET?=KWJx86/dOuDsNWW6vMYhi0jElZP0fs6S/38e8T8pCCY=
TEST_ENV_AH_SVC_WWW_SQLITE_DB_FILE?=ah_svc_www_test.sqlite3.db
TEST_ENV_AH_SVC_WWW_SQLITE_DB_DSN?=/tmp/$(TEST_ENV_AH_SVC_WWW_SQLITE_DB_FILE)







PACKAGE_DIR = _build/packaged
PACKAGE_PROTO_NAME = proto.tar.gz

PROTOC_VERSION=3.5.1
PROTOC_REPO_URL=https://github.com/google/protobuf/releases/download/v$(PROTOC_VERSION)
PROTOC_BIN=_tools/bin/protoc

ifeq ($(DEBUG_TEST),0)
DEBUG_TEST_FLAG=
else
DEBUG_TEST_FLAG=-d
endif

ifeq ($(USE_GOGO),0)
NO_GOGO_FLAG=--no-gogo
else
NO_GOGO_FLAG=
endif

ifeq ($(OS_NAME),windows)
  PROTOC_PKG_NAME := protoc-$(PROTOC_VERSION)-win32.zip
endif
ifeq ($(OS_NAME),darwin)
  ifeq ($(OS_ARCH),amd64)
    PROTOC_PKG_NAME := protoc-$(PROTOC_VERSION)-osx-x86_64.zip
  else
    PROTOC_PKG_NAME := protoc-$(PROTOC_VERSION)-osx-x86_32.zip
  endif
endif
ifeq ($(OS_NAME),linux)
  ifeq ($(OS_ARCH),arm64)
    PROTOC_PKG_NAME := protoc-$(PROTOC_VERSION)-linux-aarch_64.zip
  else
    ifeq ($(OS_ARCH),amd64)
      PROTOC_PKG_NAME := protoc-$(PROTOC_VERSION)-linux-x86_64.zip
    else
      PROTOC_PKG_NAME := protoc-$(PROTOC_VERSION)-linux-x86_32.zip
    endif
  endif
endif

CMD_SHASUM = shasum -a 256
ifeq ($(OS_NAME),openbsd)
  CMD_SHASUM = sha256 -r
endif

# release arguments mangement
# usage :
#    make release <Git flow option : start|finish> <Release version : major|minor|patch> [Release version metadata (optional)]
ifeq (release,$(firstword $(MAKECMDGOALS)))
  RELEASE_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  ifneq ($(filter $(firstword $(RELEASE_ARGS)),start finish),)
    ifneq ($(filter $(word 2,$(RELEASE_ARGS)),major minor patch),)
        $(eval $(RELEASE_ARGS):;@:)
      else
        $(error unknow release version - usage : "make release <Git flow option : start|finish> <Release version : major|minor|patch> [Release version metadata (optional)]")
    endif
  else
    $(error unknow release state - usage : "make release <Git flow option : start|finish> <Release version : major|minor|patch> [Release version metadata (optional)]")
  endif
endif

define package_builder
	@echo "$(NAME): build $(1) - $(2) on $(3) - CC=$(4)"
	-mkdir -p $(3)
	cp VERSION $(3)/VERSION
	cp LICENSE $(3)/LICENSE
	cp CHANGELOG.md $(3)/CHANGELOG.md
	$(eval FILE_NAME := $(shell if [ "$(1)" = "windows" ]; then echo "$(NAME).exe"; else echo "$(NAME)"; fi))
	CC=$(4) GOOS=$(1) GOARCH=$(2) \
		CGO_ENABLED=$(GO_CGO_ENABLED) go build \
			-ldflags '-extldflags "-lm -lstdc++ -static"' \
			-ldflags "-X $(GO_PACKAGE_NAME)/service.version=$(VERSION) -X $(GO_PACKAGE_NAME)/service.name=$(NAME)" \
			-o $(3)/$(FILE_NAME) \
		main.go
	cd $(3) && $(CMD_SHASUM) $(FILE_NAME) > SHA256SUM
	@echo ""
endef

define package_shasum
	@echo "$(NAME): package_shasum"
	cd $(PACKAGE_DIR) \
	  &&	find */* '!' -name 'VERSION' '!' -name 'LICENSE' '!' -name '*SUM' '!' -name '*SUMS' \
		| xargs $(CMD_SHASUM) > SHA256SUMS
	cd $(PACKAGE_DIR) && [ -f "$(PACKAGE_PROTO_NAME)" ] && $(CMD_SHASUM) $(PACKAGE_PROTO_NAME) >> SHA256SUMS
endef

.PHONY: build
build: proto ui
	@echo "$(NAME): build task"
	-mkdir -p _build
	CGO_ENABLED=$(GO_CGO_ENABLED) go build \
		-ldflags '-extldflags "-lm -lstdc++ -static"' \
		-ldflags "-X $(GO_PACKAGE_NAME)/service.version=$(VERSION) -X $(GO_PACKAGE_NAME)/service.name=$(NAME)" \
		-o _build/$(NAME) \
	main.go

.PHONY: clean
clean: tools-clean package-clean proto-clean
	@echo "$(NAME): clean task"

.PHONY: ui
ui: tools
	@echo "$(NAME): ui task"
	cd ui/elm && make build
	_tools/bin/go-bindata -o ui/assets.go -pkg ui -prefix ui ui/assets/...

.PHONY: proto
proto: tools proto-gen-doc
	@echo "$(NAME): proto task"
	PATH=$(shell pwd)/_tools/bin:${PATH} && \
		for f in $(GO_PROTO_PACKAGE_ALIAS)/*.proto; do \
			protoc -I. \
				-I$(shell pwd)/third_party \
				--gogo_out=plugins=grpc,\
Mgoogle/protobuf/timestamp.proto=github.com/gogo/protobuf/types,\
Mgoogle/protobuf/empty.proto=github.com/gogo/protobuf/types,\
Mgoogle/api/annotations.proto=github.com/gogo/googleapis/google/api,\
Mgoogle/protobuf/field_mask.proto=github.com/gogo/protobuf/types:\
"${GOPATH}/src" \
				--grpchan_out="${GOPATH}/src" \
				--govalidators_out=gogoimport=true,\
Mgoogle/protobuf/timestamp.proto=github.com/gogo/protobuf/types,\
Mgoogle/protobuf/empty.proto=github.com/gogo/protobuf/types,\
Mgoogle/api/annotations.proto=github.com/gogo/googleapis/google/api,\
Mgoogle/protobuf/field_mask.proto=github.com/gogo/protobuf/types:\
"${GOPATH}/src" \
				--grpc-gateway_out=logtostderr=true,\
Mgoogle/protobuf/timestamp.proto=github.com/gogo/protobuf/types,\
Mgoogle/protobuf/empty.proto=github.com/gogo/protobuf/types,\
Mgoogle/api/annotations.proto=github.com/gogo/googleapis/google/api,\
Mgoogle/protobuf/field_mask.proto=github.com/gogo/protobuf/types:\
"${GOPATH}/src" \
				--swagger_out="logtostderr=true:." \
				--gomeetfaker_out=gogoimport=true,\
Mgoogle/protobuf/timestamp.proto=github.com/gogo/protobuf/types,\
Mgoogle/protobuf/empty.proto=github.com/gogo/protobuf/types,\
Mgoogle/api/annotations.proto=github.com/gogo/googleapis/google/api,\
Mgoogle/protobuf/field_mask.proto=github.com/gogo/protobuf/types:\
"${GOPATH}/src" \
				--gomeet-service_out="gogoimport=true;project_pkg=${GO_PACKAGE_NAME};db_types=${DB_TYPES};extra_serve_flags=${EXTRA_SERVE_FLAGS};default_prefixes=${DEFAULT_PREFIXES};sub_services=${SUB_SERVICES}:${GOPATH}/src" \
			$$f; \
		echo "$(NAME): compiled proto file - " $$f; \
		echo ""; \
	done
	cd $(GO_PROTO_PACKAGE_ALIAS) && go generate .

.PHONY: proto-gen-doc
proto-gen-doc:
	@echo "$(NAME): proto task"
	PATH=$(shell pwd)/_tools/bin:${GOPATH}/src/github.com/gomeet/gomeet/_build:${PATH} && \
		for f in $(GO_PROTO_PACKAGE_ALIAS)/*.proto; do \
			for t in "docbook,$(NAME).docbook" "html,$(NAME).html" "markdown,$(NAME).md"; do \
				protoc -I. \
					-I$(shell pwd)/third_party \
					--plugin=$(shell pwd)/_tools/bin/protoc-gen-doc \
					--doc_out=./docs/grpc-services/ \
					--doc_opt="$$t:google/*,github.com/*" \
				$$f; \
			done; \
		echo "$(NAME): gen doc files from " $$f; \
		echo ""; \
	done
	-mv docs/grpc-services/$(NAME).md docs/grpc-services/README.md
	-mv docs/grpc-services/$(NAME).html docs/grpc-services/index.html

.PHONY: proto-clean
proto-clean:
	@echo "$(NAME): proto-clean task"
	-rm $(GO_PROTO_PACKAGE_ALIAS)/*.pb.* $(GO_PROTO_PACKAGE_ALIAS)/*.swagger.json

.PHONY: package-arm32
package-arm32: proto
	@echo "$(NAME): package-arm32 task"
	$(call package_builder,linux,arm,$(PACKAGE_DIR)/linux-arm32,arm-linux-gnueabihf-gcc)

.PHONY: package-arm64
package-arm64: proto
	@echo "$(NAME): package-arm64 task"
	$(call package_builder,linux,arm64,$(PACKAGE_DIR)/linux-arm64,arm-linux-gnueabihf-gcc)

.PHONY: package-amd64
package-amd64: package-amd64-linux  package-amd64-darwin  package-amd64-openbsd  package-amd64-windows
	@echo "$(NAME): package-amd64 task"

.PHONY: package-amd64-linux
package-amd64-linux: proto
	@echo "$(NAME): package-amd64-linux task"
	$(call package_builder,linux,amd64,$(PACKAGE_DIR)/linux-amd64,x86_64-pc-linux-gcc)

.PHONY: package-amd64-darwin
package-amd64-darwin: proto
	@echo "$(NAME): package-amd64-darwin task"
	$(call package_builder,darwin,amd64,$(PACKAGE_DIR)/darwin-amd64,x86_64-pc-linux-gcc)

.PHONY: package-amd64-opanbsd
package-amd64-openbsd: proto
	@echo "$(NAME): package-amd64-openbsd task"
	$(call package_builder,openbsd,amd64,$(PACKAGE_DIR)/openbsd-amd64,x86_64-pc-linux-gcc)

.PHONY: package-amd64-windows
package-amd64-windows: proto
	@echo "$(NAME): package-amd64-windows task"
	$(call package_builder,windows,amd64,$(PACKAGE_DIR)/windows-amd64,x86_64-pc-linux-gcc)

.PHONY: package
package: clean package-proto docker package-arm32 package-arm64 package-amd64
	@echo "$(NAME): package task"
	cp VERSION $(PACKAGE_DIR)/VERSION
	cp LICENSE $(PACKAGE_DIR)/LICENSE
	cp CHANGELOG.md $(PACKAGE_DIR)/CHANGLOG.md
	$(call package_shasum)

.PHONY: package-clean
package-clean:
	@echo "$(NAME): package-clean task"
	-rm -r $(PACKAGE_DIR)

.PHONY: package-proto
package-proto:
	@echo "$(NAME): package-proto task"
	mkdir -p $(PACKAGE_DIR)
	cp -r third_party $(PACKAGE_DIR)/proto
	cp $(GO_PROTO_PACKAGE_ALIAS)/*.proto $(PACKAGE_DIR)/proto/
	cp VERSION $(PACKAGE_DIR)/proto/
	cd $(PACKAGE_DIR) && tar -C ./proto/ -czvf $(PACKAGE_PROTO_NAME) . && rm -rf ./proto/
	$(call package_shasum)

.PHONY: release
release: tools
	$(eval RELEASE_META := $(word 3, $(RELEASE_ARGS)))
	$(eval RELEASE_META_FULL := $(if $(RELEASE_META),"+$(RELEASE_META)",""))
	$(eval RELEASE_VERSION := $(shell if [ "$(word 2,$(RELEASE_ARGS))" = "patch" ]; then echo "`sed 's/+dev//g' VERSION`$(RELEASE_META_FULL)" ; else _tools/bin/semver -$(word 2,$(RELEASE_ARGS)) -build "$(RELEASE_META)" $(VERSION); fi))
	echo "$(NAME): new $(word 2,$(RELEASE_ARGS)) release -> $(RELEASE_VERSION)"
	git flow release start "v$(RELEASE_VERSION)"
	echo "$(RELEASE_VERSION)" > VERSION
	git add VERSION
	git commit -m "Bump version - v$(RELEASE_VERSION)"
	awk \
		-v \
		log_title="## Unreleased\n\n- Nothing\n\n## $(RELEASE_VERSION) - $$(date +%Y-%m-%d)" \
		'{gsub(/## Unreleased/,log_title)}1' \
		CHANGELOG.md > CHANGELOG.md.tmp && \
			mv CHANGELOG.md.tmp CHANGELOG.md
	git add CHANGELOG.md
	git commit -m "Improved CHANGELOG.md"
	# TODO don't push binaries in git repository but use github release process
	#@$(MAKE) package
	#@$(MAKE) docker-push
	#git add _build/packaged/
	#git commit -m "Added v$(RELEASE_VERSION) packages"
	#git add .env
	#git commit -m "Added docker-compose .env"
	git flow release publish "v$(RELEASE_VERSION)"
ifeq (finish,$(firstword $(RELEASE_ARGS)))
	git flow release finish "v$(RELEASE_VERSION)"
	$(eval DEV_RELEASE_VERSION := $(shell _tools/bin/semver -patch -build "dev" $(RELEASE_VERSION)))
	echo "$(DEV_RELEASE_VERSION)" > VERSION
	git add VERSION
	git commit -m "Bump version - $(DEV_RELEASE_VERSION)"
	# TODO don't push binaries in git repository
	#@$(MAKE) package
	#@$(MAKE) docker-push
	#git add .env
	#git add $(PACKAGE_DIR)
	#git commit -m "Added v$(DEV_RELEASE_VERSION) packages"
	git push --tag
	git push origin develop
	git push origin master
endif

.PHONY: docker
docker:
	echo "TAG=$(DOCKER_TAG)" > .env

	echo 'AH_SVC_WWW_SQLITE_DB_FILE=$(DOCKER_ENV_AH_SVC_WWW_SQLITE_DB_FILE)' >> .env


	-docker build -t $(DOCKER_IMAGE_NAME):$(DOCKER_TAG) .

.PHONY: docker-push
docker-push: docker
	-docker tag $(DOCKER_IMAGE_NAME):$(DOCKER_TAG) $(DOCKER_REGISTRY)/$(DOCKER_IMAGE_NAME):$(DOCKER_TAG)
	-docker push $(DOCKER_REGISTRY)/$(DOCKER_IMAGE_NAME):$(DOCKER_TAG)

.PHONY: start
start: docker
	docker-compose up -d
	@echo "\n\
	Grafana:\n\
		http://localhost:3000/\n\
		For admin password see GF_SECURITY_ADMIN_PASSWORD in $(shell pwd)/infra/config.monitoring file\n\
	Prometheus:\n\
		http://localhost:9090/\n\
	Alert manager:\n\
		http://localhost:9093/\n\
	Swagger docs:\n\
		http://localhost:8000/docs\n\
	Godoc:\n\
		http://localhost:8001/pkg/github.com/hugdubois/$(NAME)\n\
	Documentation: \n\
		$(shell pwd)/docs/docker/README.md \n\
		$(shell pwd)/docs/docker-compose/README.md\n\
		$(shell pwd)/docs/grafana/README.md\n\
		"

.PHONY: stop
stop:
	docker-compose down
	@echo "\nTo remove volume use :\n        docker volume prune -f"

.PHONY: install
install:
	go install .

.PHONY: dep
dep: tools
	_tools/bin/dep ensure

.PHONY: dep-prune
dep-prune: tools
	_tools/bin/dep prune

.PHONY: dep-init
dep-init: tools
	_tools/bin/dep init


.PHONY: dep-update-gomeet-utils
dep-update-gomeet-utils: tools
	@echo "$(NAME): dep-update-gomeet-utils task"
	_tools/bin/dep ensure -update "$(GOMEET_GO_PACKAGE_NAME)"

.PHONY: tools
tools:
	@echo "$(NAME): tools task"
ifeq ("$(wildcard _tools/src/github.com/twitchtv/retool)","")
	$(MAKE) tools-sync-retool
endif
	GOPATH=$(shell pwd)/_tools/ && \
		go install github.com/twitchtv/retool
	_tools/bin/retool build
ifeq ("$(wildcard $(PROTOC_BIN))","")
	$(MAKE) tools-sync-protoc
endif

.PHONY: tools-clean
tools-clean:
	@echo "$(NAME): tools-clean task"
	-rm -rf _tools/bin _tools/pkg _tools/manifest.json _tools/protoc

.PHONY: tools-sync
tools-sync: tools-sync-retool tools-sync-protoc
	@echo "$(NAME): tools-sync task"

.PHONY: tools-sync-retool
tools-sync-retool:
	@echo "$(NAME): tools-sync-retool task"
	GOPATH=$(shell pwd)/_tools/ && \
		go get github.com/twitchtv/retool && \
		go install github.com/twitchtv/retool
	_tools/bin/retool sync

.PHONY: tools-sync-protoc
tools-sync-protoc:
	@echo "$(NAME): tools-sync-protoc task"
	@rm -rf _tools/protoc
	@mkdir -p _tools/protoc
	@mkdir -p _tools/bin
	@curl -L -o _tools/protoc/$(PROTOC_PKG_NAME) $(PROTOC_REPO_URL)/$(PROTOC_PKG_NAME)
	@cd _tools/protoc && unzip $(PROTOC_PKG_NAME)
	@cp _tools/protoc/bin/protoc $(PROTOC_BIN)
	@cp -r _tools/protoc/include/google/protobuf/* third_party/google/protobuf/

.PHONY: tools-upgrade-gomeet
tools-upgrade-gomeet: tools
	@echo "$(NAME): tools-upgrade-gomeet task"
	_tools/bin/retool upgrade github.com/gomeet/gomeet-tools-markdown-server origin/master
	_tools/bin/retool upgrade github.com/gomeet/go-proto-gomeetfaker/protoc-gen-gomeetfaker origin/master
	_tools/bin/retool upgrade github.com/gomeet/gomeet/protoc-gen-gomeet-service origin/master
	_tools/bin/retool upgrade github.com/gomeet/gomeet/gomeet origin/master

.PHONY: tools-upgrade
tools-upgrade: tools
	@echo "$(NAME): tools-upgrade task"
	GOPATH=$(shell pwd)/_tools/ && \
		for tool in $(shell cat tools.json | grep "Repository" | awk '{print $$2}' | sed 's/,//g' | sed 's/"//g' ); do $$GOPATH/bin/retool upgrade $$tool origin/master ; done

.PHONY: test-func
test-func: build
	@echo "$(NAME): test-func task"
	@_build/$(NAME) functest $(DEBUG_TEST_FLAG) -e --jwt-secret=$(TEST_ENV_HUGDUBOIS_JWT_SECRET) --random-port --sqlite-migrate --sqlite-dsn="$(TEST_ENV_AH_SVC_WWW_SQLITE_DB_DSN)"

.PHONY: test-unit
test-unit:
	@echo "$(NAME): test-unit task"
	@if ls models/*_test.go 1> /dev/null 2>&1; then cd models && go test -sqlite-dsn="$(TEST_ENV_AH_SVC_WWW_SQLITE_DB_DSN)"; fi
	@if ls $(GO_PROTO_PACKAGE_ALIAS)/*_test.go 1> /dev/null 2>&1; then cd $(GO_PROTO_PACKAGE_ALIAS) && go test; fi
	@cd service && go test $(DEBUG_TEST_FLAG) -sqlite-dsn="$(TEST_ENV_AH_SVC_WWW_SQLITE_DB_DSN)"

.PHONY: test-race
test-race:
	@echo "$(NAME): test-race task"
	@if ls models/*_test.go 1> /dev/null 2>&1; then cd models && go test -race -sqlite-dsn="$(TEST_ENV_AH_SVC_WWW_SQLITE_DB_DSN)"; fi
	@if ls $(GO_PROTO_PACKAGE_ALIAS)/*_test.go 1> /dev/null 2>&1; then cd $(GO_PROTO_PACKAGE_ALIAS) && go test -race; fi
	@cd service && go test $(DEBUG_TEST_FLAG) -race -sqlite-dsn="$(TEST_ENV_AH_SVC_WWW_SQLITE_DB_DSN)"

.PHONY: test
test:
	@echo "$(NAME): test task"
	@$(MAKE) test-func
	@$(MAKE) test-unit
	@$(MAKE) test-race

.PHONY: docker-test
docker-test: docker
	docker run -v $(shell pwd):/go/src/$(GO_PACKAGE_NAME) --rm golang:1.8.3-alpine3.6 /bin/sh -c "cd /go/src/$(GO_PACKAGE_NAME)/service && go test"
	docker run --rm $(DOCKER_IMAGE_NAME):$(DOCKER_TAG) functest -e

.PHONY: doc-server
doc-server: tools
	_tools/bin/gomeet-tools-markdown-server

.PHONY: gomeet-regenerate-project
gomeet-regenerate-project: tools
	@echo "$(NAME): gomeet-regenerate-project task"
	_tools/bin/gomeet new ${GO_PACKAGE_NAME} \
		--default-prefixes='${DEFAULT_PREFIXES}' \
		--proto-name='${GO_PROTO_PACKAGE_ALIAS}' \
		--sub-services='${SUB_SERVICES}' \
		--db-types='${DB_TYPES}' \
		--extra-serve-flags='${EXTRA_SERVE_FLAGS}' \
		--force $(NO_GOGO_FLAG)

