// Code generated by protoc-gen-gomeet-service. DO NOT EDIT.
// source: pb/www.proto
package service

import (
	"golang.org/x/net/context"

	"github.com/gomeet/gomeet/utils/log"

	pb "github.com/hugdubois/ah-svc-www/pb"
)

func (s *wwwServer) Version(ctx context.Context, req *pb.EmptyMessage) (*pb.VersionResponse, error) {
	log.Debug(ctx, "message call", log.Fields{"req": req})

	v := &pb.VersionResponse{
		Name:    name,
		Version: s.version,
	}

	return v, nil
}
