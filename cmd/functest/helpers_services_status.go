// Code generated by protoc-gen-gomeet-service. DO NOT EDIT.
// source: pb/www.proto
package functest

import (
	"fmt"
	"sort"

	pb "github.com/hugdubois/ah-svc-www/pb"
	"github.com/hugdubois/ah-svc-www/service"
)

type servicesStatusByName []*pb.ServiceStatus

func (n servicesStatusByName) Len() int           { return len(n) }
func (n servicesStatusByName) Swap(i, j int)      { n[i], n[j] = n[j], n[i] }
func (n servicesStatusByName) Less(i, j int) bool { return n[i].Name < n[j].Name }

func testServicesStatusReponse(
	config FunctionalTestConfig,
	req *pb.EmptyMessage,
	res *pb.ServicesStatusList,
) (failures []TestFailure) {
	svc := service.NewService()

	var expected []*pb.ServiceStatus
	// SUB-SERVICES DEFINITION : test-functest
	expected = append(expected, &pb.ServiceStatus{Name: svc.Name, Version: svc.Version, Status: pb.ServiceStatus_OK, EMsg: ""})
	// expected = append(expected, &pb.ServiceStatus{Name: "ah-svc-{{SubServiceNameKebabCase}}, Version:  "unknow", Status:  pb.ServiceStatus_UNAVAILABLE, EMsg:  ""})
	// END SUB-SERVICES DEFINITION : test-functest

	sort.Sort(servicesStatusByName(expected))

	ssStatus := res.GetServices()

	if len(ssStatus) != len(expected) {
		failureMsg := fmt.Sprintf("expected services count \"%d\" but got \"%d\"", len(expected), len(ssStatus))
		failures = append(failures, TestFailure{Procedure: "ServciesStatus", Message: failureMsg})
		return failures
	}

	for i, sStatus := range ssStatus {
		if sStatus.GetName() != expected[i].GetName() {
			failureMsg := fmt.Sprintf("expected name \"%s\" but got \"%s\"", svc.Name, sStatus.GetName())
			failures = append(failures, TestFailure{Procedure: "ServiceStatus", Message: failureMsg})
		}

		if sStatus.GetVersion() != expected[i].GetVersion() {
			failureMsg := fmt.Sprintf("expected version number \"%s\" but got \"%s\"", svc.Version, sStatus.GetVersion())
			failures = append(failures, TestFailure{Procedure: "ServicesSatus", Message: failureMsg})
		}
	}

	return failures
}
