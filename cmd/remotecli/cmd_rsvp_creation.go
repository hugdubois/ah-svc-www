package remotecli

import (
	"errors"
	"fmt"
	"strconv"

	pb "github.com/hugdubois/ah-svc-www/pb"
)

func (c *remoteCli) cmdRsvpCreation(args []string) (string, error) {
	if len(args) < 7 {
		return "", errors.New("Bad arguments : rsvp_creation <names [string]> <email [string]> <presence [bool]> <children_name_age [string]> <housing [bool]> <music [string]> <brunch [bool]>")
	}

	// request message
	var req *pb.RsvpCreationRequest

	// decl req for no nil panic
	req = &pb.RsvpCreationRequest{}

	// cast args[0] in req.Names - type TYPE_STRING to go type string
	req.Names = args[0]

	// cast args[1] in req.Email - type TYPE_STRING to go type string
	req.Email = args[1]

	// cast args[2] in req.Presence - type TYPE_BOOL to go type bool
	reqPresence, err := strconv.ParseBool(args[2])
	if err != nil {
		return "", fmt.Errorf("Bad arguments : presence is not bool")
	}
	req.Presence = reqPresence

	// cast args[3] in req.ChildrenNameAge - type TYPE_STRING to go type string
	req.ChildrenNameAge = args[3]

	// cast args[4] in req.Housing - type TYPE_BOOL to go type bool
	reqHousing, err := strconv.ParseBool(args[4])
	if err != nil {
		return "", fmt.Errorf("Bad arguments : housing is not bool")
	}
	req.Housing = reqHousing

	// cast args[5] in req.Music - type TYPE_STRING to go type string
	req.Music = args[5]

	// cast args[6] in req.Brunch - type TYPE_BOOL to go type bool
	reqBrunch, err := strconv.ParseBool(args[6])
	if err != nil {
		return "", fmt.Errorf("Bad arguments : brunch is not bool")
	}
	req.Brunch = reqBrunch

	// message validation - github.com/mwitkow/go-proto-validators
	if reqValidator, ok := interface{}(*req).(interface {
		Validate() error
	}); ok {
		if err := reqValidator.Validate(); err != nil {
			return "", err
		}
	}

	// sending message to server
	ctx, cancel := c.GetTimeoutContext(c.GetDefaultTimeout())
	defer cancel()

	r, err := c.c.RsvpCreation(ctx, req)
	if err != nil {
		return "", fmt.Errorf("RsvpCreation service call fail - %v", err)
	}

	return fmt.Sprintf("RsvpCreation: %v", r), nil
}
