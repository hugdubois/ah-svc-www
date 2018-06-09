# ah-svc-www elm ui

## Make directives

- `make build` - do a `make build-proto build-css` or `make build-open-api build-css`
- `make build-proto` - Build with `proto` generation. It's equivalent to `make build-elm-proto build-css`
- `make build-elm-proto` - Build with `proto` generation
- `make proto` - Build from protobuf file
- `make build-elm-open-api` - Build elm with open-api mode
- `make build-open-api` - Build with `open-api` generation. It's equivalent to `make build-open-api-proto build-css`
- `make open-api` - Generate API from `open-api` (`../../pb/swagger.json`)
- `make tools-open-api` - Install tools for `*open-api*`
- `make build-css` - Build css from scss file and webpack config
- `make setup` - setup dependencies `npm install`
- `make clean-artifacts` - Removing elm-artifacts
- `make clean` - Removing all generated files

