# golang builder
FROM golang:1.8.3-alpine3.6 AS builder
WORKDIR /go/src/github.com/hugdubois/ah-svc-www/
COPY . .
RUN apk add --no-cache --update git make protobuf protobuf-dev ca-certificates curl && \
     rm -rf /var/cache/apk/*
RUN rm -f /go/src/github.com/hugdubois/ah-svc-www/_build/ah-svc-www
RUN make tools-clean tools-sync tools
RUN make

# cf. https://hub.docker.com/r/gomeet/gomeet-builder/
# FROM gomeet/gomeet-builder:0.0.3 AS builder
# WORKDIR /go/src/github.com/hugdubois/ah-svc-www/
# COPY . .
# RUN rm -f /go/src/github.com/hugdubois/ah-svc-www/_build/ah-svc-www
# RUN make

# minimal image from scratch
FROM scratch
LABEL maintainer="Hugues Dubois <hugdubois@gmail.com>"
COPY --from=builder /etc/ssl/certs /etc/ssl/certs
COPY --from=builder /go/src/github.com/hugdubois/ah-svc-www/_build/ah-svc-www /ah-svc-www
EXPOSE 13000
ENTRYPOINT ["/ah-svc-www"]
CMD ["serve"]
