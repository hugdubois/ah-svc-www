package functest

import (
	"fmt"

	pb "github.com/hugdubois/ah-svc-www/pb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func testGetRsvpCreationRequest(
	config FunctionalTestConfig,
) (reqs []*pb.RsvpCreationRequest, extras map[string]interface{}, err error) {
	validRequest := pb.NewRsvpCreationRequestGomeetFaker()

	// error cases
	reqs = append(reqs, &pb.RsvpCreationRequest{})
	reqs = append(reqs, &pb.RsvpCreationRequest{Names: validRequest.GetNames()})
	// valid cases
	reqs = append(reqs, validRequest)
	return reqs, extras, err
}

func testRsvpCreationResponse(
	config FunctionalTestConfig,
	testsType string,
	testCaseResults []*TestCaseResult,
	extras map[string]interface{},
) (failures []TestFailure) {
	for i, tr := range testCaseResults {
		var (
			req *pb.RsvpCreationRequest
			res *pb.RsvpCreationResponse
			err error
			ok  bool
		)
		if tr.Request == nil {
			failures = append(failures, TestFailure{Procedure: "RsvpCreation", Message: "expected request message type pb.RsvpCreationRequest - nil given"})
			continue
		}
		req, ok = tr.Request.(*pb.RsvpCreationRequest)
		if !ok {
			failures = append(failures, TestFailure{Procedure: "RsvpCreation", Message: "expected request message type pb.RsvpCreationRequest - cast fail"})
			continue
		}

		err = tr.Error
		//fmt.Printf("%d - %v\n", i, err)
		if i < 2 {
			if err == nil {
				//failures = append(failures, TestFailure{Procedure: "RsvpCreation", Message: "an error is expected"})
				failures = append(failures, TestFailure{Procedure: "RsvpCreation", Message: fmt.Sprintf("an error is expected -- %d - %s", i, testsType)})
			}
			if testsType == "GRPC" {
				var (
					expectedCode    codes.Code
					expectedMessage string
				)
				e := status.Convert(err)
				switch {
				case i < 1:
					expectedCode = codes.InvalidArgument
					expectedMessage = "invalid field Names: value '' must length be greater than '1'"
				case i < 2:
					expectedCode = codes.InvalidArgument
					expectedMessage = "invalid field Email: Invalid email"
				}
				if e.Code() != expectedCode {
					failures = append(failures, TestFailure{Procedure: "RsvpCreation", Message: fmt.Sprintf("Error code \"%v\" is expected got \"%v\"", expectedCode, e.Code())})
				}
				if e.Message() != expectedMessage {
					failures = append(failures, TestFailure{Procedure: "RsvpCreation", Message: fmt.Sprintf("Error message \"%v\" is expected got \"%v\"", expectedMessage, e.Message())})
				}
			}
			continue
		}

		if err != nil {
			failures = append(failures, TestFailure{Procedure: "RsvpCreation", Message: fmt.Sprintf("no error expected got (%s) -- %d %s", err, i, testsType)})
			continue
		}

		if tr.Response == nil {
			failures = append(failures, TestFailure{Procedure: "RsvpCreation", Message: "a response is expected"})
			continue
		}

		res, ok = tr.Response.(*pb.RsvpCreationResponse)
		if !ok {
			failures = append(failures, TestFailure{Procedure: "RsvpCreation", Message: "expected response message type pb.RsvpCreationResponse - cast fail"})
			continue
		}
		if req == nil || res == nil {
			failures = append(failures, TestFailure{Procedure: "RsvpCreation", Message: "a request and a response are expected"})
			continue
		}
		if !res.GetOk() {
			failures = append(failures, TestFailure{Procedure: "RsvpCreation", Message: "the true value is expected for the Ok attribute of the response"})
			continue
		}
		//if res.GetInfo() == nil {
		//failures = append(failures, TestFailure{Procedure: "RsvpCreation", Message: "no nil Rsvp is expected"})
		//continue
		//}
		//fmt.Printf("%d - %v\n", i, res)
		// TODO more tests
	}

	return failures
}
