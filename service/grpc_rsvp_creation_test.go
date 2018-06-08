package service

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"golang.org/x/net/context"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	pb "github.com/hugdubois/ah-svc-www/pb"
)

func TestRsvpCreation(t *testing.T) {
	var (
		req  *pb.RsvpCreationRequest
		vReq *pb.RsvpCreationRequest
		res  *pb.RsvpCreationResponse
		err  error
		e    *status.Status
	)

	flushAllDbTest(t)
	ctx := context.Background()

	vReq = pb.NewRsvpCreationRequestGomeetFaker()

	req = &pb.RsvpCreationRequest{}
	res, err = cli.RsvpCreation(ctx, req)
	assert.NotNil(t, err, "RsvpCreation: error on call")
	assert.Nil(t, res, "RsvpCreation: error on call")
	e = status.Convert(err)
	assert.Equal(t, codes.InvalidArgument, e.Code(), "RsvpCreation: error on call")
	assert.Equal(t, "invalid field Names: value '' must length be greater than '1'", e.Message(), "RsvpCreation: error on call")

	req = &pb.RsvpCreationRequest{Names: vReq.GetNames()}
	res, err = cli.RsvpCreation(ctx, req)
	assert.NotNil(t, err, "RsvpCreation: error on call")
	assert.Nil(t, res, "RsvpCreation: error on call")
	e = status.Convert(err)
	assert.Equal(t, codes.InvalidArgument, e.Code(), "RsvpCreation: error on call")
	assert.Equal(t, "invalid field Email: Invalid email", e.Message(), "RsvpCreation: error on call")

	res, err = cli.RsvpCreation(ctx, vReq)
	assert.Nil(t, err, "RsvpCreation: error on call")
	assert.NotNil(t, res, "RsvpCreation: error on call")
	assert.True(t, res.GetOk(), "RsvpCreation: error on call")
}
