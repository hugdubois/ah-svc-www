package service

import (
	"golang.org/x/net/context"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/gomeet/gomeet/utils/log"

	"github.com/hugdubois/ah-svc-www/models"
	pb "github.com/hugdubois/ah-svc-www/pb"
)

func (s *wwwServer) RsvpCreation(ctx context.Context, req *pb.RsvpCreationRequest) (*pb.RsvpCreationResponse, error) {
	log.Debug(ctx, "service call", log.Fields{"req": req})

	// init the response
	res := &pb.RsvpCreationResponse{
		Ok: false,
	}

	// validate request
	if err := req.Validate(); err != nil {
		log.Warn(ctx, "invalid request", err, log.Fields{
			"req": req,
		})

		return res, status.Error(codes.InvalidArgument, err.Error())
	}

	// init database if not ready yet
	err := s.initDatabaseHandle()
	if err != nil {
		log.Warn(ctx, "Fail to initDatabase", err, log.Fields{})

		return res, status.Errorf(codes.Internal, err.Error())
	}

	// create profile in database
	dbRsvp, err := models.CreateRsvp(
		s.sqliteHandle,
		req.GetNames(),
		req.GetEmail(),
		req.GetPresence(),
		req.GetChildrenNameAge(),
		req.GetHousing(),
		req.GetMusic(),
		req.GetBrunch(),
	)
	if err != nil {
		log.Error(ctx, "database insert error", err, log.Fields{
			"req": req,
		})

		return res, status.Errorf(codes.InvalidArgument, err.Error())
	}

	// cast profile from model to protocol
	res.Ok = true
	res.Info = convertRsvpFromModelToProtocol(dbRsvp)

	return res, nil
}
