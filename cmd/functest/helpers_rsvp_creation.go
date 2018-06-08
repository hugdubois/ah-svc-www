package functest

import (
	pb "github.com/hugdubois/ah-svc-www/pb"
)

func testGetRsvpCreationRequest(
	config FunctionalTestConfig,
) (reqs []*pb.RsvpCreationRequest, extras map[string]interface{}, err error) {
	// return an array of pb.RsvpCreationRequest struct pointers,
	// each of them will be passed as an argument to the grpc RsvpCreation method

	reqs = append(reqs, &pb.RsvpCreationRequest{})
	return reqs, extras, err
}

func testRsvpCreationResponse(
	config FunctionalTestConfig,
	testsType string,
	testCaseResults []*TestCaseResult,
	extras map[string]interface{},
) (failures []TestFailure) {
	// Do something useful functional test with
	// testCaseResults[n].Request, testCaseResults[n].Response and testCaseResults[n].Error
	// then return a array of TestFailure struct
	// testsType value is value of FUNCTEST_HTTP (HTTP) and FUNCTEST_GRPC (GRPC) constants cf. types.go
	for _, tr := range testCaseResults {
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

		if tr.Response != nil {
			res, ok = tr.Response.(*pb.RsvpCreationResponse)
			if !ok {
				failures = append(failures, TestFailure{Procedure: "RsvpCreation", Message: "expected response message type pb.RsvpCreationRequest - cast fail"})
				continue
			}
		}

		// Do something useful functional test with req, res and err
		err = tr.Error
		if err != nil {
			// if no error are expected do something like this
			// failures = append(failures, TestFailure{Procedure: "RsvpCreation", Message: "no error expected"})
			// continue
		}

		if req != nil && res != nil {
			// for example :
			// if res.GetId() != req.GetId() {
			//     failureMsg := fmt.Sprintf("expected ID \"%s\" but got \"%s\" for request: %v", req.GetId(), res.GetId(), req)
			//     failures = append(failures, TestFailure{Procedure: "RsvpCreation", Message: failureMsg})
			// }
		}
	}

	return failures
}
