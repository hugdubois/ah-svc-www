package service

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"golang.org/x/net/context"

	pb "github.com/hugdubois/ah-svc-www/pb"
)

func TestRsvpCreation(t *testing.T) {
	ctx := context.Background()

	req := &pb.RsvpCreationRequest{}
	// You can generate a fake request see https://github.com/gomeet/go-proto-gomeetfaker
	// req := &pb.RsvpCreationRequest{}
	res, err := cli.RsvpCreation(ctx, req)
	assert.Nil(t, err, "RsvpCreation: error on call")
	assert.NotNil(t, res, "RsvpCreation: error on call")

	// Do something useful tests with req and res
	// for example :
	// assert.Equal(t, req.GetUuid(), res.GetUuid(), "RsvpCreation: Uuid field in response must be the same as that of the request")
}
