ELM_FILES = $(shell find . -path ./elm-stuff -prune -o -type f -name '*.elm')
TYPE = proto

build: build-$(TYPE)

build-proto: build-elm-proto build-css
	cp elm.js ../assets/js/rsvp.js
	cp elm-mdc.js ../assets/js/elm-mdc.js
	cp material-components-web.css ../assets/css/material-components-web.css

build-elm-proto: proto
	elm-make --yes src/Main.elm --output elm.js

proto:
	@echo "$(NAME): proto task"
	PATH=$(shell pwd)/../../_tools/bin:${GOPATH}/src/github.com/tiziano88/elm-protobuf/protoc-gen-elm:${GOPATH}/src/github.com/gomeet/gomeet/_build:${PATH} && \
		for f in pb/*.proto; do \
			protoc -I. \
				-I$(shell pwd)/../../third_party \
				--plugin=$(shell pwd)/../../_tools/bin/protoc-gen-elm \
				--elm_out=src/ \
			$$f; \
			echo "$(NAME): gen elm file from " $$f; \
			echo ""; \
		done

build-elm-open-api: open-api
	elm-make --yes src/Main.elm --output elm.js

build-open-api: build-elm-open-api build-css
	cp elm.js ../assets/js/rsvp.js
	cp elm-mdc.js ../assets/js/elm-mdc.js
	cp material-components-web.css ../assets/css/material-components-web.css

open-api: tools-open-api
	java -jar _tools/swagger-codegen-cli.jar generate \
		-i ../../pb/www.swagger.json \
		-l elm \
		-o .

tools-open-api:
	mkdir -p _tools
	cd _tools && \
		wget http://central.maven.org/maven2/io/swagger/swagger-codegen-cli/2.3.1/swagger-codegen-cli-2.3.1.jar -O swagger-codegen-cli.jar

build-css:
	./node_modules/.bin/webpack

setup:
	npm i
	cd node_modules/elm-mdc/ && make elm-mdc.js
	cp node_modules/elm-mdc/elm-mdc.js .
	cd node_modules/elm-mdc/ && make distclean

clean-artifacts:
	rm -f material-components-web.css style-bundle.js elm.js
	rm -rf elm-stuff/build-artifacts

clean: clean-artifacts
	rm -rf elm-stuff _tools node_modules .swagger-codegen
	rm -f elm-mdc.js
