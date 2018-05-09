package service

import (
	"golang.org/x/net/context"

	"github.com/gomeet/gomeet/utils/log"

	pb "github.com/hugdubois/ah-svc-www/pb"
)

func (s *wwwServer) Echo(ctx context.Context, req *pb.EchoRequest) (*pb.EchoResponse, error) {
	log.Debug(ctx, "service call", log.Fields{"req": req})

	// res := &pb.EchoResponse{}
	// Do something useful with req and res
	// for now a fake response is returned see https://github.com/gomeet/go-proto-gomeetfaker
	res := pb.NewEchoResponseGomeetFaker()

	return res, nil
}
