// Code generated by protoc-gen-gomeet-service. DO NOT EDIT.
// source: pb/www.proto
package functest

import (
	"fmt"

	pb "github.com/hugdubois/ah-svc-www/pb"
)

func TestServicesStatus(config FunctionalTestConfig) (failures []TestFailure) {
	client, ctx, err := grpcClient(config)
	if err != nil {
		failures = append(failures, TestFailure{Procedure: "ServicesSatus", Message: fmt.Sprintf("gRPC client initialization error (%v)", err)})
		return failures
	}
	defer client.Close()

	req := &pb.EmptyMessage{}
	res, err := client.GetGRPCClient().ServicesStatus(ctx, req)
	if err != nil {
		// one retry if the connection is unavailable
		client, ctx, err := grpcClient(config)
		if err != nil {
			failures = append(failures, TestFailure{Procedure: "ServicesStatus", Message: fmt.Sprintf("gRPC client initialization error (%v)", err)})
			return failures
		}
		defer client.Close()
		res, err = client.GetGRPCClient().ServicesStatus(ctx, req)
		if err != nil {
			failures = append(failures, TestFailure{Procedure: "ServciesStatus", Message: fmt.Sprintf("call error (%v)", err)})
			return failures
		}
	}

	return testServicesStatusReponse(config, req, res)
}
