// Code generated by protoc-gen-gogo. DO NOT EDIT.
// source: pb/www.proto

/*
Package pb is a generated protocol buffer package.

It is generated from these files:
	pb/www.proto

It has these top-level messages:
	EmptyMessage
	VersionResponse
	ServiceStatus
	ServicesStatusList
	RsvpCreationRequest
	RsvpInfo
	RsvpCreationResponse
*/
package pb

import proto "github.com/gogo/protobuf/proto"
import golang_proto "github.com/golang/protobuf/proto"
import fmt "fmt"
import math "math"
import _ "github.com/gogo/googleapis/google/api"
import _ "github.com/mwitkow/go-proto-validators"
import _ "github.com/gomeet/go-proto-gomeetfaker"
import _ "github.com/gogo/protobuf/gogoproto"

import context "golang.org/x/net/context"
import grpc "google.golang.org/grpc"

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = golang_proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto.GoGoProtoPackageIsVersion2 // please upgrade the proto package

type ServiceStatus_Status int32

const (
	ServiceStatus_OK          ServiceStatus_Status = 0
	ServiceStatus_UNAVAILABLE ServiceStatus_Status = 1
)

var ServiceStatus_Status_name = map[int32]string{
	0: "OK",
	1: "UNAVAILABLE",
}
var ServiceStatus_Status_value = map[string]int32{
	"OK":          0,
	"UNAVAILABLE": 1,
}

func (x ServiceStatus_Status) String() string {
	return proto.EnumName(ServiceStatus_Status_name, int32(x))
}
func (ServiceStatus_Status) EnumDescriptor() ([]byte, []int) { return fileDescriptorWww, []int{2, 0} }

type EmptyMessage struct {
}

func (m *EmptyMessage) Reset()                    { *m = EmptyMessage{} }
func (m *EmptyMessage) String() string            { return proto.CompactTextString(m) }
func (*EmptyMessage) ProtoMessage()               {}
func (*EmptyMessage) Descriptor() ([]byte, []int) { return fileDescriptorWww, []int{0} }

// VersionMessage represents a version message
type VersionResponse struct {
	// Id represents the message identifier.
	Name    string `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
	Version string `protobuf:"bytes,2,opt,name=version,proto3" json:"version,omitempty"`
}

func (m *VersionResponse) Reset()                    { *m = VersionResponse{} }
func (m *VersionResponse) String() string            { return proto.CompactTextString(m) }
func (*VersionResponse) ProtoMessage()               {}
func (*VersionResponse) Descriptor() ([]byte, []int) { return fileDescriptorWww, []int{1} }

func (m *VersionResponse) GetName() string {
	if m != nil {
		return m.Name
	}
	return ""
}

func (m *VersionResponse) GetVersion() string {
	if m != nil {
		return m.Version
	}
	return ""
}

// SeviceStatus represents a sub services status message
type ServiceStatus struct {
	Name    string               `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
	Version string               `protobuf:"bytes,2,opt,name=version,proto3" json:"version,omitempty"`
	Status  ServiceStatus_Status `protobuf:"varint,3,opt,name=status,proto3,enum=grpc.hugdubois.www.ServiceStatus_Status" json:"status,omitempty"`
	EMsg    string               `protobuf:"bytes,4,opt,name=e_msg,json=eMsg,proto3" json:"e_msg,omitempty"`
}

func (m *ServiceStatus) Reset()                    { *m = ServiceStatus{} }
func (m *ServiceStatus) String() string            { return proto.CompactTextString(m) }
func (*ServiceStatus) ProtoMessage()               {}
func (*ServiceStatus) Descriptor() ([]byte, []int) { return fileDescriptorWww, []int{2} }

func (m *ServiceStatus) GetName() string {
	if m != nil {
		return m.Name
	}
	return ""
}

func (m *ServiceStatus) GetVersion() string {
	if m != nil {
		return m.Version
	}
	return ""
}

func (m *ServiceStatus) GetStatus() ServiceStatus_Status {
	if m != nil {
		return m.Status
	}
	return ServiceStatus_OK
}

func (m *ServiceStatus) GetEMsg() string {
	if m != nil {
		return m.EMsg
	}
	return ""
}

// ServicesStatusList is the sub services status list
type ServicesStatusList struct {
	Services []*ServiceStatus `protobuf:"bytes,1,rep,name=services" json:"services,omitempty"`
}

func (m *ServicesStatusList) Reset()                    { *m = ServicesStatusList{} }
func (m *ServicesStatusList) String() string            { return proto.CompactTextString(m) }
func (*ServicesStatusList) ProtoMessage()               {}
func (*ServicesStatusList) Descriptor() ([]byte, []int) { return fileDescriptorWww, []int{3} }

func (m *ServicesStatusList) GetServices() []*ServiceStatus {
	if m != nil {
		return m.Services
	}
	return nil
}

// RsvpCreationRequest encodes the request of a rsvp creation operation.
type RsvpCreationRequest struct {
	Names           string `protobuf:"bytes,1,opt,name=names,proto3" json:"names,omitempty"`
	Email           string `protobuf:"bytes,2,opt,name=email,proto3" json:"email,omitempty"`
	Presence        bool   `protobuf:"varint,3,opt,name=presence,proto3" json:"presence,omitempty"`
	ChildrenNameAge string `protobuf:"bytes,4,opt,name=children_name_age,json=childrenNameAge,proto3" json:"children_name_age,omitempty"`
	Housing         bool   `protobuf:"varint,5,opt,name=housing,proto3" json:"housing,omitempty"`
	Music           string `protobuf:"bytes,6,opt,name=music,proto3" json:"music,omitempty"`
	Brunch          bool   `protobuf:"varint,7,opt,name=brunch,proto3" json:"brunch,omitempty"`
}

func (m *RsvpCreationRequest) Reset()                    { *m = RsvpCreationRequest{} }
func (m *RsvpCreationRequest) String() string            { return proto.CompactTextString(m) }
func (*RsvpCreationRequest) ProtoMessage()               {}
func (*RsvpCreationRequest) Descriptor() ([]byte, []int) { return fileDescriptorWww, []int{4} }

func (m *RsvpCreationRequest) GetNames() string {
	if m != nil {
		return m.Names
	}
	return ""
}

func (m *RsvpCreationRequest) GetEmail() string {
	if m != nil {
		return m.Email
	}
	return ""
}

func (m *RsvpCreationRequest) GetPresence() bool {
	if m != nil {
		return m.Presence
	}
	return false
}

func (m *RsvpCreationRequest) GetChildrenNameAge() string {
	if m != nil {
		return m.ChildrenNameAge
	}
	return ""
}

func (m *RsvpCreationRequest) GetHousing() bool {
	if m != nil {
		return m.Housing
	}
	return false
}

func (m *RsvpCreationRequest) GetMusic() string {
	if m != nil {
		return m.Music
	}
	return ""
}

func (m *RsvpCreationRequest) GetBrunch() bool {
	if m != nil {
		return m.Brunch
	}
	return false
}

// RsvpInfo encodes a rsvp.
type RsvpInfo struct {
	Uuid            string `protobuf:"bytes,1,opt,name=uuid,proto3" json:"uuid,omitempty"`
	Names           string `protobuf:"bytes,2,opt,name=names,proto3" json:"names,omitempty"`
	Email           string `protobuf:"bytes,3,opt,name=email,proto3" json:"email,omitempty"`
	Presence        bool   `protobuf:"varint,4,opt,name=presence,proto3" json:"presence,omitempty"`
	ChildrenNameAge string `protobuf:"bytes,5,opt,name=children_name_age,json=childrenNameAge,proto3" json:"children_name_age,omitempty"`
	Housing         bool   `protobuf:"varint,6,opt,name=housing,proto3" json:"housing,omitempty"`
	Music           string `protobuf:"bytes,7,opt,name=music,proto3" json:"music,omitempty"`
	Brunch          bool   `protobuf:"varint,8,opt,name=brunch,proto3" json:"brunch,omitempty"`
	CreatedAt       string `protobuf:"bytes,9,opt,name=created_at,json=createdAt,proto3" json:"created_at,omitempty"`
	UpdatedAt       string `protobuf:"bytes,10,opt,name=updated_at,json=updatedAt,proto3" json:"updated_at,omitempty"`
	DeletedAt       string `protobuf:"bytes,11,opt,name=deleted_at,json=deletedAt,proto3" json:"deleted_at,omitempty"`
}

func (m *RsvpInfo) Reset()                    { *m = RsvpInfo{} }
func (m *RsvpInfo) String() string            { return proto.CompactTextString(m) }
func (*RsvpInfo) ProtoMessage()               {}
func (*RsvpInfo) Descriptor() ([]byte, []int) { return fileDescriptorWww, []int{5} }

func (m *RsvpInfo) GetUuid() string {
	if m != nil {
		return m.Uuid
	}
	return ""
}

func (m *RsvpInfo) GetNames() string {
	if m != nil {
		return m.Names
	}
	return ""
}

func (m *RsvpInfo) GetEmail() string {
	if m != nil {
		return m.Email
	}
	return ""
}

func (m *RsvpInfo) GetPresence() bool {
	if m != nil {
		return m.Presence
	}
	return false
}

func (m *RsvpInfo) GetChildrenNameAge() string {
	if m != nil {
		return m.ChildrenNameAge
	}
	return ""
}

func (m *RsvpInfo) GetHousing() bool {
	if m != nil {
		return m.Housing
	}
	return false
}

func (m *RsvpInfo) GetMusic() string {
	if m != nil {
		return m.Music
	}
	return ""
}

func (m *RsvpInfo) GetBrunch() bool {
	if m != nil {
		return m.Brunch
	}
	return false
}

func (m *RsvpInfo) GetCreatedAt() string {
	if m != nil {
		return m.CreatedAt
	}
	return ""
}

func (m *RsvpInfo) GetUpdatedAt() string {
	if m != nil {
		return m.UpdatedAt
	}
	return ""
}

func (m *RsvpInfo) GetDeletedAt() string {
	if m != nil {
		return m.DeletedAt
	}
	return ""
}

// RsvpCreationResponse encodes the result of a rsvp creation operation.
type RsvpCreationResponse struct {
	Ok   bool      `protobuf:"varint,1,opt,name=ok,proto3" json:"ok,omitempty"`
	Info *RsvpInfo `protobuf:"bytes,2,opt,name=info" json:"info,omitempty"`
}

func (m *RsvpCreationResponse) Reset()                    { *m = RsvpCreationResponse{} }
func (m *RsvpCreationResponse) String() string            { return proto.CompactTextString(m) }
func (*RsvpCreationResponse) ProtoMessage()               {}
func (*RsvpCreationResponse) Descriptor() ([]byte, []int) { return fileDescriptorWww, []int{6} }

func (m *RsvpCreationResponse) GetOk() bool {
	if m != nil {
		return m.Ok
	}
	return false
}

func (m *RsvpCreationResponse) GetInfo() *RsvpInfo {
	if m != nil {
		return m.Info
	}
	return nil
}

func init() {
	proto.RegisterType((*EmptyMessage)(nil), "grpc.hugdubois.www.EmptyMessage")
	golang_proto.RegisterType((*EmptyMessage)(nil), "grpc.hugdubois.www.EmptyMessage")
	proto.RegisterType((*VersionResponse)(nil), "grpc.hugdubois.www.VersionResponse")
	golang_proto.RegisterType((*VersionResponse)(nil), "grpc.hugdubois.www.VersionResponse")
	proto.RegisterType((*ServiceStatus)(nil), "grpc.hugdubois.www.ServiceStatus")
	golang_proto.RegisterType((*ServiceStatus)(nil), "grpc.hugdubois.www.ServiceStatus")
	proto.RegisterType((*ServicesStatusList)(nil), "grpc.hugdubois.www.ServicesStatusList")
	golang_proto.RegisterType((*ServicesStatusList)(nil), "grpc.hugdubois.www.ServicesStatusList")
	proto.RegisterType((*RsvpCreationRequest)(nil), "grpc.hugdubois.www.RsvpCreationRequest")
	golang_proto.RegisterType((*RsvpCreationRequest)(nil), "grpc.hugdubois.www.RsvpCreationRequest")
	proto.RegisterType((*RsvpInfo)(nil), "grpc.hugdubois.www.RsvpInfo")
	golang_proto.RegisterType((*RsvpInfo)(nil), "grpc.hugdubois.www.RsvpInfo")
	proto.RegisterType((*RsvpCreationResponse)(nil), "grpc.hugdubois.www.RsvpCreationResponse")
	golang_proto.RegisterType((*RsvpCreationResponse)(nil), "grpc.hugdubois.www.RsvpCreationResponse")
	proto.RegisterEnum("grpc.hugdubois.www.ServiceStatus_Status", ServiceStatus_Status_name, ServiceStatus_Status_value)
	golang_proto.RegisterEnum("grpc.hugdubois.www.ServiceStatus_Status", ServiceStatus_Status_name, ServiceStatus_Status_value)
}
func (this *EmptyMessage) Equal(that interface{}) bool {
	if that == nil {
		return this == nil
	}

	that1, ok := that.(*EmptyMessage)
	if !ok {
		that2, ok := that.(EmptyMessage)
		if ok {
			that1 = &that2
		} else {
			return false
		}
	}
	if that1 == nil {
		return this == nil
	} else if this == nil {
		return false
	}
	return true
}
func (this *VersionResponse) Equal(that interface{}) bool {
	if that == nil {
		return this == nil
	}

	that1, ok := that.(*VersionResponse)
	if !ok {
		that2, ok := that.(VersionResponse)
		if ok {
			that1 = &that2
		} else {
			return false
		}
	}
	if that1 == nil {
		return this == nil
	} else if this == nil {
		return false
	}
	if this.Name != that1.Name {
		return false
	}
	if this.Version != that1.Version {
		return false
	}
	return true
}
func (this *ServiceStatus) Equal(that interface{}) bool {
	if that == nil {
		return this == nil
	}

	that1, ok := that.(*ServiceStatus)
	if !ok {
		that2, ok := that.(ServiceStatus)
		if ok {
			that1 = &that2
		} else {
			return false
		}
	}
	if that1 == nil {
		return this == nil
	} else if this == nil {
		return false
	}
	if this.Name != that1.Name {
		return false
	}
	if this.Version != that1.Version {
		return false
	}
	if this.Status != that1.Status {
		return false
	}
	if this.EMsg != that1.EMsg {
		return false
	}
	return true
}
func (this *ServicesStatusList) Equal(that interface{}) bool {
	if that == nil {
		return this == nil
	}

	that1, ok := that.(*ServicesStatusList)
	if !ok {
		that2, ok := that.(ServicesStatusList)
		if ok {
			that1 = &that2
		} else {
			return false
		}
	}
	if that1 == nil {
		return this == nil
	} else if this == nil {
		return false
	}
	if len(this.Services) != len(that1.Services) {
		return false
	}
	for i := range this.Services {
		if !this.Services[i].Equal(that1.Services[i]) {
			return false
		}
	}
	return true
}
func (this *RsvpCreationRequest) Equal(that interface{}) bool {
	if that == nil {
		return this == nil
	}

	that1, ok := that.(*RsvpCreationRequest)
	if !ok {
		that2, ok := that.(RsvpCreationRequest)
		if ok {
			that1 = &that2
		} else {
			return false
		}
	}
	if that1 == nil {
		return this == nil
	} else if this == nil {
		return false
	}
	if this.Names != that1.Names {
		return false
	}
	if this.Email != that1.Email {
		return false
	}
	if this.Presence != that1.Presence {
		return false
	}
	if this.ChildrenNameAge != that1.ChildrenNameAge {
		return false
	}
	if this.Housing != that1.Housing {
		return false
	}
	if this.Music != that1.Music {
		return false
	}
	if this.Brunch != that1.Brunch {
		return false
	}
	return true
}
func (this *RsvpInfo) Equal(that interface{}) bool {
	if that == nil {
		return this == nil
	}

	that1, ok := that.(*RsvpInfo)
	if !ok {
		that2, ok := that.(RsvpInfo)
		if ok {
			that1 = &that2
		} else {
			return false
		}
	}
	if that1 == nil {
		return this == nil
	} else if this == nil {
		return false
	}
	if this.Uuid != that1.Uuid {
		return false
	}
	if this.Names != that1.Names {
		return false
	}
	if this.Email != that1.Email {
		return false
	}
	if this.Presence != that1.Presence {
		return false
	}
	if this.ChildrenNameAge != that1.ChildrenNameAge {
		return false
	}
	if this.Housing != that1.Housing {
		return false
	}
	if this.Music != that1.Music {
		return false
	}
	if this.Brunch != that1.Brunch {
		return false
	}
	if this.CreatedAt != that1.CreatedAt {
		return false
	}
	if this.UpdatedAt != that1.UpdatedAt {
		return false
	}
	if this.DeletedAt != that1.DeletedAt {
		return false
	}
	return true
}
func (this *RsvpCreationResponse) Equal(that interface{}) bool {
	if that == nil {
		return this == nil
	}

	that1, ok := that.(*RsvpCreationResponse)
	if !ok {
		that2, ok := that.(RsvpCreationResponse)
		if ok {
			that1 = &that2
		} else {
			return false
		}
	}
	if that1 == nil {
		return this == nil
	} else if this == nil {
		return false
	}
	if this.Ok != that1.Ok {
		return false
	}
	if !this.Info.Equal(that1.Info) {
		return false
	}
	return true
}

// Reference imports to suppress errors if they are not otherwise used.
var _ context.Context
var _ grpc.ClientConn

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
const _ = grpc.SupportPackageIsVersion4

// Client API for Www service

type WwwClient interface {
	// Version method receives no paramaters and returns a version message.
	Version(ctx context.Context, in *EmptyMessage, opts ...grpc.CallOption) (*VersionResponse, error)
	// ServicesStatus method receives no paramaters and returns all services status message
	ServicesStatus(ctx context.Context, in *EmptyMessage, opts ...grpc.CallOption) (*ServicesStatusList, error)
	// RsvpCreation attempts to create a new rsvp.
	RsvpCreation(ctx context.Context, in *RsvpCreationRequest, opts ...grpc.CallOption) (*RsvpCreationResponse, error)
}

type wwwClient struct {
	cc *grpc.ClientConn
}

func NewWwwClient(cc *grpc.ClientConn) WwwClient {
	return &wwwClient{cc}
}

func (c *wwwClient) Version(ctx context.Context, in *EmptyMessage, opts ...grpc.CallOption) (*VersionResponse, error) {
	out := new(VersionResponse)
	err := grpc.Invoke(ctx, "/grpc.hugdubois.www.Www/Version", in, out, c.cc, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *wwwClient) ServicesStatus(ctx context.Context, in *EmptyMessage, opts ...grpc.CallOption) (*ServicesStatusList, error) {
	out := new(ServicesStatusList)
	err := grpc.Invoke(ctx, "/grpc.hugdubois.www.Www/ServicesStatus", in, out, c.cc, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *wwwClient) RsvpCreation(ctx context.Context, in *RsvpCreationRequest, opts ...grpc.CallOption) (*RsvpCreationResponse, error) {
	out := new(RsvpCreationResponse)
	err := grpc.Invoke(ctx, "/grpc.hugdubois.www.Www/RsvpCreation", in, out, c.cc, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// Server API for Www service

type WwwServer interface {
	// Version method receives no paramaters and returns a version message.
	Version(context.Context, *EmptyMessage) (*VersionResponse, error)
	// ServicesStatus method receives no paramaters and returns all services status message
	ServicesStatus(context.Context, *EmptyMessage) (*ServicesStatusList, error)
	// RsvpCreation attempts to create a new rsvp.
	RsvpCreation(context.Context, *RsvpCreationRequest) (*RsvpCreationResponse, error)
}

func RegisterWwwServer(s *grpc.Server, srv WwwServer) {
	s.RegisterService(&_Www_serviceDesc, srv)
}

func _Www_Version_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(EmptyMessage)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(WwwServer).Version(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/grpc.hugdubois.www.Www/Version",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(WwwServer).Version(ctx, req.(*EmptyMessage))
	}
	return interceptor(ctx, in, info, handler)
}

func _Www_ServicesStatus_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(EmptyMessage)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(WwwServer).ServicesStatus(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/grpc.hugdubois.www.Www/ServicesStatus",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(WwwServer).ServicesStatus(ctx, req.(*EmptyMessage))
	}
	return interceptor(ctx, in, info, handler)
}

func _Www_RsvpCreation_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(RsvpCreationRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(WwwServer).RsvpCreation(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/grpc.hugdubois.www.Www/RsvpCreation",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(WwwServer).RsvpCreation(ctx, req.(*RsvpCreationRequest))
	}
	return interceptor(ctx, in, info, handler)
}

var _Www_serviceDesc = grpc.ServiceDesc{
	ServiceName: "grpc.hugdubois.www.Www",
	HandlerType: (*WwwServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "Version",
			Handler:    _Www_Version_Handler,
		},
		{
			MethodName: "ServicesStatus",
			Handler:    _Www_ServicesStatus_Handler,
		},
		{
			MethodName: "RsvpCreation",
			Handler:    _Www_RsvpCreation_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "pb/www.proto",
}

func NewPopulatedEmptyMessage(r randyWww, easy bool) *EmptyMessage {
	this := &EmptyMessage{}
	if !easy && r.Intn(10) != 0 {
	}
	return this
}

func NewPopulatedVersionResponse(r randyWww, easy bool) *VersionResponse {
	this := &VersionResponse{}
	this.Name = string(randStringWww(r))
	this.Version = string(randStringWww(r))
	if !easy && r.Intn(10) != 0 {
	}
	return this
}

func NewPopulatedServiceStatus(r randyWww, easy bool) *ServiceStatus {
	this := &ServiceStatus{}
	this.Name = string(randStringWww(r))
	this.Version = string(randStringWww(r))
	this.Status = ServiceStatus_Status([]int32{0, 1}[r.Intn(2)])
	this.EMsg = string(randStringWww(r))
	if !easy && r.Intn(10) != 0 {
	}
	return this
}

func NewPopulatedServicesStatusList(r randyWww, easy bool) *ServicesStatusList {
	this := &ServicesStatusList{}
	if r.Intn(10) != 0 {
		v1 := r.Intn(5)
		this.Services = make([]*ServiceStatus, v1)
		for i := 0; i < v1; i++ {
			this.Services[i] = NewPopulatedServiceStatus(r, easy)
		}
	}
	if !easy && r.Intn(10) != 0 {
	}
	return this
}

func NewPopulatedRsvpCreationRequest(r randyWww, easy bool) *RsvpCreationRequest {
	this := &RsvpCreationRequest{}
	this.Names = string(randStringWww(r))
	this.Email = string(randStringWww(r))
	this.Presence = bool(bool(r.Intn(2) == 0))
	this.ChildrenNameAge = string(randStringWww(r))
	this.Housing = bool(bool(r.Intn(2) == 0))
	this.Music = string(randStringWww(r))
	this.Brunch = bool(bool(r.Intn(2) == 0))
	if !easy && r.Intn(10) != 0 {
	}
	return this
}

func NewPopulatedRsvpInfo(r randyWww, easy bool) *RsvpInfo {
	this := &RsvpInfo{}
	this.Uuid = string(randStringWww(r))
	this.Names = string(randStringWww(r))
	this.Email = string(randStringWww(r))
	this.Presence = bool(bool(r.Intn(2) == 0))
	this.ChildrenNameAge = string(randStringWww(r))
	this.Housing = bool(bool(r.Intn(2) == 0))
	this.Music = string(randStringWww(r))
	this.Brunch = bool(bool(r.Intn(2) == 0))
	this.CreatedAt = string(randStringWww(r))
	this.UpdatedAt = string(randStringWww(r))
	this.DeletedAt = string(randStringWww(r))
	if !easy && r.Intn(10) != 0 {
	}
	return this
}

func NewPopulatedRsvpCreationResponse(r randyWww, easy bool) *RsvpCreationResponse {
	this := &RsvpCreationResponse{}
	this.Ok = bool(bool(r.Intn(2) == 0))
	if r.Intn(10) != 0 {
		this.Info = NewPopulatedRsvpInfo(r, easy)
	}
	if !easy && r.Intn(10) != 0 {
	}
	return this
}

type randyWww interface {
	Float32() float32
	Float64() float64
	Int63() int64
	Int31() int32
	Uint32() uint32
	Intn(n int) int
}

func randUTF8RuneWww(r randyWww) rune {
	ru := r.Intn(62)
	if ru < 10 {
		return rune(ru + 48)
	} else if ru < 36 {
		return rune(ru + 55)
	}
	return rune(ru + 61)
}
func randStringWww(r randyWww) string {
	v2 := r.Intn(100)
	tmps := make([]rune, v2)
	for i := 0; i < v2; i++ {
		tmps[i] = randUTF8RuneWww(r)
	}
	return string(tmps)
}
func randUnrecognizedWww(r randyWww, maxFieldNumber int) (dAtA []byte) {
	l := r.Intn(5)
	for i := 0; i < l; i++ {
		wire := r.Intn(4)
		if wire == 3 {
			wire = 5
		}
		fieldNumber := maxFieldNumber + r.Intn(100)
		dAtA = randFieldWww(dAtA, r, fieldNumber, wire)
	}
	return dAtA
}
func randFieldWww(dAtA []byte, r randyWww, fieldNumber int, wire int) []byte {
	key := uint32(fieldNumber)<<3 | uint32(wire)
	switch wire {
	case 0:
		dAtA = encodeVarintPopulateWww(dAtA, uint64(key))
		v3 := r.Int63()
		if r.Intn(2) == 0 {
			v3 *= -1
		}
		dAtA = encodeVarintPopulateWww(dAtA, uint64(v3))
	case 1:
		dAtA = encodeVarintPopulateWww(dAtA, uint64(key))
		dAtA = append(dAtA, byte(r.Intn(256)), byte(r.Intn(256)), byte(r.Intn(256)), byte(r.Intn(256)), byte(r.Intn(256)), byte(r.Intn(256)), byte(r.Intn(256)), byte(r.Intn(256)))
	case 2:
		dAtA = encodeVarintPopulateWww(dAtA, uint64(key))
		ll := r.Intn(100)
		dAtA = encodeVarintPopulateWww(dAtA, uint64(ll))
		for j := 0; j < ll; j++ {
			dAtA = append(dAtA, byte(r.Intn(256)))
		}
	default:
		dAtA = encodeVarintPopulateWww(dAtA, uint64(key))
		dAtA = append(dAtA, byte(r.Intn(256)), byte(r.Intn(256)), byte(r.Intn(256)), byte(r.Intn(256)))
	}
	return dAtA
}
func encodeVarintPopulateWww(dAtA []byte, v uint64) []byte {
	for v >= 1<<7 {
		dAtA = append(dAtA, uint8(uint64(v)&0x7f|0x80))
		v >>= 7
	}
	dAtA = append(dAtA, uint8(v))
	return dAtA
}

func init() { proto.RegisterFile("pb/www.proto", fileDescriptorWww) }
func init() { golang_proto.RegisterFile("pb/www.proto", fileDescriptorWww) }

var fileDescriptorWww = []byte{
	// 1052 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0xd4, 0x56, 0xc1, 0x53, 0xdb, 0xc6,
	0x17, 0xfe, 0xad, 0x2c, 0xcb, 0x66, 0x21, 0x40, 0xf6, 0x47, 0x27, 0x86, 0xa1, 0x60, 0x04, 0x21,
	0x8e, 0x53, 0x59, 0xb2, 0x43, 0x28, 0x71, 0x27, 0x25, 0x76, 0x27, 0xed, 0x30, 0x85, 0xb4, 0x23,
	0x52, 0x3a, 0x25, 0x25, 0x1e, 0x59, 0x5e, 0x64, 0x0d, 0x58, 0xab, 0x6a, 0x25, 0xab, 0x0d, 0xb8,
	0xd3, 0x49, 0x8e, 0x3d, 0x76, 0xfa, 0x0f, 0xe4, 0xd4, 0x83, 0xa7, 0xe7, 0xf4, 0xd6, 0xb3, 0xaf,
	0xed, 0x9d, 0x29, 0xed, 0x7f, 0xd0, 0x4b, 0x8f, 0x1d, 0xaf, 0xd7, 0x20, 0x28, 0x34, 0xd0, 0x9e,
	0x7a, 0xb2, 0x9e, 0xde, 0xfb, 0xbe, 0xf7, 0xfc, 0xde, 0xd3, 0x7e, 0x0b, 0x87, 0xdc, 0xaa, 0x1a,
	0x86, 0x61, 0xce, 0xf5, 0x88, 0x4f, 0x10, 0xb2, 0x3c, 0xd7, 0xcc, 0xd5, 0x03, 0xab, 0x16, 0x54,
	0x89, 0x4d, 0x73, 0x61, 0x18, 0x4e, 0x4c, 0x5a, 0x84, 0x58, 0xbb, 0x58, 0x35, 0x5c, 0x5b, 0x35,
	0x1c, 0x87, 0xf8, 0x86, 0x6f, 0x13, 0x87, 0xf6, 0x10, 0x13, 0x8b, 0x96, 0xed, 0xd7, 0x83, 0x6a,
	0xce, 0x24, 0x0d, 0xb5, 0x11, 0xda, 0xfe, 0x0e, 0x09, 0x55, 0x8b, 0x28, 0xcc, 0xa9, 0x34, 0x8d,
	0x5d, 0xbb, 0x66, 0xf8, 0xc4, 0xa3, 0xea, 0xd1, 0x23, 0xc7, 0x2d, 0x45, 0x70, 0x16, 0x69, 0x60,
	0xec, 0x1f, 0xc3, 0x7a, 0xf6, 0xb6, 0xb1, 0x83, 0x3d, 0x35, 0xf2, 0xcc, 0x91, 0xca, 0x09, 0xa4,
	0x45, 0x54, 0xf6, 0xba, 0x1a, 0x6c, 0x33, 0x8b, 0x19, 0xec, 0xa9, 0x17, 0x2e, 0x0f, 0xc3, 0xa1,
	0x07, 0x0d, 0xd7, 0xff, 0x62, 0x0d, 0x53, 0x6a, 0x58, 0x58, 0x5e, 0x87, 0x23, 0x1b, 0xd8, 0xa3,
	0x36, 0x71, 0x74, 0x4c, 0x5d, 0xe2, 0x50, 0x8c, 0x26, 0xa1, 0xe8, 0x18, 0x0d, 0x9c, 0x02, 0x69,
	0x90, 0x19, 0x28, 0x27, 0x3b, 0x6d, 0x49, 0xcc, 0x0a, 0xa3, 0x40, 0x67, 0x6f, 0x91, 0x0c, 0x13,
	0xcd, 0x1e, 0x20, 0x25, 0x44, 0x03, 0x52, 0x40, 0xef, 0x3b, 0xe4, 0x9f, 0x01, 0xbc, 0xb2, 0x8e,
	0xbd, 0xa6, 0x6d, 0xe2, 0x75, 0xdf, 0xf0, 0x03, 0xfa, 0xef, 0x39, 0xd1, 0x7d, 0x28, 0x51, 0xc6,
	0x95, 0x8a, 0xa5, 0x41, 0x66, 0xb8, 0x90, 0xc9, 0xfd, 0x75, 0x38, 0xb9, 0x13, 0x49, 0x73, 0xbd,
	0x1f, 0x9d, 0xe3, 0xd0, 0x24, 0x8c, 0xe3, 0x4a, 0x83, 0x5a, 0x29, 0x91, 0xe5, 0x48, 0x74, 0xda,
	0x52, 0xec, 0x25, 0x00, 0xba, 0x88, 0xd7, 0xa8, 0x25, 0xcf, 0x40, 0x89, 0xd7, 0x2a, 0x41, 0xe1,
	0x83, 0xf7, 0x47, 0xff, 0x87, 0x46, 0xe0, 0xe0, 0x47, 0x0f, 0x4b, 0x1b, 0xa5, 0x95, 0xd5, 0x52,
	0x79, 0xf5, 0xc1, 0x28, 0x90, 0xd7, 0x21, 0xe2, 0x09, 0x68, 0x2f, 0x74, 0xd5, 0xa6, 0x3e, 0xba,
	0x07, 0x93, 0x94, 0xbf, 0x4d, 0x81, 0x74, 0x2c, 0x33, 0x58, 0x98, 0x79, 0x65, 0x69, 0xfa, 0x11,
	0x44, 0x3e, 0x88, 0xc1, 0xff, 0xeb, 0xb4, 0xe9, 0xbe, 0xe3, 0x61, 0xb6, 0x49, 0x3a, 0xfe, 0x2c,
	0xc0, 0xd4, 0x47, 0x59, 0x18, 0xef, 0xf6, 0x86, 0xf2, 0x96, 0x8d, 0x75, 0xda, 0x52, 0xe2, 0x19,
	0x10, 0xb3, 0x42, 0x52, 0x3a, 0x3c, 0x98, 0x8e, 0xbb, 0xc2, 0xe7, 0x5f, 0x09, 0x7a, 0x2f, 0x04,
	0xfd, 0x00, 0x60, 0x1c, 0x37, 0x0c, 0x7b, 0x97, 0xb7, 0xef, 0x05, 0xe8, 0xf6, 0xef, 0xa9, 0x30,
	0x0a, 0x0e, 0x0f, 0xa6, 0xbf, 0x05, 0xf0, 0x39, 0x78, 0xf2, 0xd8, 0x50, 0x9e, 0x96, 0x94, 0x4d,
	0x4d, 0xb9, 0x9b, 0x9b, 0x99, 0x9d, 0xbb, 0x3e, 0x7f, 0x23, 0x7b, 0x4b, 0xbd, 0xb7, 0xfc, 0xa4,
	0xb2, 0xb7, 0xdf, 0xfa, 0x52, 0xd9, 0xba, 0x75, 0xff, 0xd8, 0xbf, 0x95, 0x59, 0x2e, 0x1e, 0x5b,
	0xca, 0xd6, 0x9e, 0xf6, 0xc6, 0x62, 0xbe, 0x15, 0xf1, 0xdf, 0x5c, 0xce, 0x2c, 0x17, 0x3f, 0xcd,
	0x5d, 0x0a, 0x71, 0x33, 0x3b, 0x97, 0xbd, 0xb2, 0xe2, 0xb0, 0xb5, 0x4f, 0xb3, 0x52, 0xf5, 0x5e,
	0xc5, 0x28, 0x03, 0x93, 0xae, 0x87, 0x29, 0x76, 0x4c, 0xcc, 0x26, 0x9b, 0x2c, 0x0f, 0x75, 0xda,
	0x52, 0x12, 0x4a, 0x48, 0xf4, 0xbd, 0x00, 0xeb, 0x47, 0x5e, 0xf4, 0x36, 0xbc, 0x6a, 0xd6, 0xed,
	0xdd, 0x9a, 0x87, 0x9d, 0x4a, 0xf7, 0x7f, 0x57, 0x0c, 0x0b, 0xf3, 0x59, 0xa2, 0x93, 0xdd, 0x89,
	0x75, 0x7b, 0x33, 0xd2, 0x0f, 0x7e, 0x68, 0x34, 0x70, 0xc9, 0xc2, 0x68, 0x1e, 0x26, 0xea, 0x24,
	0xa0, 0xb6, 0x63, 0xa5, 0xe2, 0x67, 0x24, 0xea, 0x3b, 0x51, 0x06, 0xc6, 0x1b, 0x01, 0xb5, 0xcd,
	0x94, 0x74, 0x2e, 0x77, 0x2f, 0x00, 0xcd, 0x41, 0xa9, 0xea, 0x05, 0x8e, 0x59, 0x4f, 0x25, 0xce,
	0x20, 0xe4, 0x3e, 0xf9, 0x7b, 0x09, 0x26, 0xbb, 0x13, 0x5e, 0x71, 0xb6, 0x09, 0xfa, 0x1a, 0x40,
	0x31, 0x08, 0xec, 0x1a, 0x1f, 0x6b, 0xd8, 0x69, 0x4b, 0x12, 0x12, 0x91, 0xb0, 0xb1, 0x70, 0x78,
	0x30, 0x6d, 0xc3, 0x4f, 0xba, 0x83, 0xda, 0x2e, 0x29, 0xef, 0x76, 0xdb, 0xb6, 0xb7, 0xd4, 0x52,
	0xa2, 0xe6, 0x42, 0x4b, 0x59, 0x88, 0xda, 0xb7, 0x5b, 0xca, 0xe3, 0xa5, 0xfd, 0xbb, 0xfb, 0x46,
	0x69, 0xbf, 0x5a, 0xde, 0x3a, 0xed, 0x89, 0x98, 0xf9, 0x42, 0x6b, 0x2e, 0x3b, 0xd4, 0x6f, 0x7f,
	0x37, 0xbd, 0xce, 0x8a, 0x38, 0x5e, 0x32, 0xe1, 0x32, 0x4b, 0x16, 0xfb, 0x4f, 0x2f, 0x99, 0x78,
	0xf9, 0x25, 0x8b, 0xff, 0xa3, 0x25, 0x93, 0x2e, 0xb4, 0x64, 0x89, 0x8b, 0x2f, 0x59, 0xf2, 0xfc,
	0x25, 0x43, 0x65, 0x08, 0xcd, 0xee, 0x09, 0x82, 0x6b, 0x15, 0xc3, 0x4f, 0x0d, 0x30, 0xd2, 0xd9,
	0x4e, 0x5b, 0x9a, 0xae, 0xbe, 0x8e, 0xc6, 0x0b, 0x9a, 0xb6, 0xa8, 0x68, 0x79, 0x45, 0x2b, 0x3c,
	0xca, 0xdf, 0x29, 0x6a, 0x0b, 0x45, 0xed, 0xce, 0xa6, 0xf6, 0x66, 0x51, 0xd3, 0x96, 0x80, 0x3e,
	0xc0, 0x61, 0x25, 0xbf, 0xcb, 0x11, 0xb8, 0xb5, 0x3e, 0x07, 0xbc, 0x04, 0x07, 0x87, 0xf5, 0x38,
	0x6a, 0x78, 0x17, 0x73, 0x8e, 0xc1, 0x4b, 0x70, 0x70, 0x58, 0xc9, 0x97, 0x4d, 0x38, 0x76, 0xf2,
	0x44, 0xe4, 0xc2, 0x34, 0x0e, 0x05, 0xb2, 0xc3, 0x3e, 0x9c, 0x64, 0x79, 0xa0, 0xd3, 0x96, 0xe2,
	0x30, 0x86, 0x40, 0x5e, 0x17, 0xc8, 0x0e, 0xd2, 0xa0, 0x68, 0x3b, 0xdb, 0x84, 0xed, 0xf1, 0x60,
	0x61, 0xf2, 0xac, 0x03, 0xb8, 0xff, 0x09, 0xea, 0x2c, 0xb2, 0xf0, 0xbb, 0x00, 0x63, 0x1f, 0x87,
	0x21, 0xb2, 0x61, 0x82, 0x0b, 0x20, 0x4a, 0x9f, 0x05, 0x8b, 0xaa, 0xe5, 0xc4, 0xec, 0x59, 0x11,
	0xa7, 0xf4, 0x53, 0xbe, 0xf6, 0xec, 0xa7, 0xdf, 0xbe, 0x11, 0xae, 0xa2, 0x11, 0x76, 0x47, 0x68,
	0xe6, 0xd5, 0xbe, 0x84, 0xed, 0xc1, 0xe1, 0x93, 0xfa, 0x71, 0x81, 0x8c, 0xf3, 0x7f, 0xa3, 0x25,
	0x11, 0x15, 0x92, 0xa7, 0x59, 0xd2, 0x71, 0x74, 0xad, 0x9f, 0xb4, 0x2f, 0x30, 0x2a, 0x57, 0xbf,
	0xe7, 0x00, 0x0e, 0x45, 0xbb, 0x8a, 0x6e, 0x9c, 0xd7, 0xa4, 0x53, 0x4a, 0x34, 0x91, 0x79, 0x75,
	0x20, 0xff, 0xe7, 0x69, 0x56, 0xc4, 0x84, 0xfc, 0x5a, 0xbf, 0x08, 0x8f, 0x36, 0xdd, 0x8a, 0xc9,
	0xc3, 0x8a, 0x20, 0x5b, 0x7e, 0xf4, 0xc7, 0x2f, 0x53, 0xe0, 0xbb, 0xc3, 0x29, 0xf0, 0xf2, 0x70,
	0x0a, 0xfc, 0xf8, 0xeb, 0x14, 0x80, 0x63, 0x26, 0x69, 0x9c, 0xe2, 0x6e, 0xe6, 0x37, 0xaf, 0x47,
	0x6e, 0x35, 0x47, 0x4e, 0xd5, 0xa8, 0x2b, 0xb4, 0x69, 0x2a, 0x61, 0x18, 0xaa, 0x6e, 0xf5, 0x2d,
	0xb7, 0xfa, 0x42, 0x10, 0xdf, 0x5b, 0xfb, 0xb0, 0x5c, 0x95, 0xd8, 0xdd, 0xe6, 0xf6, 0x9f, 0x01,
	0x00, 0x00, 0xff, 0xff, 0xcd, 0x11, 0xf3, 0x70, 0xbe, 0x09, 0x00, 0x00,
}
