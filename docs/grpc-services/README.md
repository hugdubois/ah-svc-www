# Protocol Documentation
<a name="top"/>

## Table of Contents

- [pb/www.proto](#pb/www.proto)
    - [EmptyMessage](#grpc.hugdubois.www.EmptyMessage)
    - [RsvpCreationRequest](#grpc.hugdubois.www.RsvpCreationRequest)
    - [RsvpCreationResponse](#grpc.hugdubois.www.RsvpCreationResponse)
    - [RsvpInfo](#grpc.hugdubois.www.RsvpInfo)
    - [ServiceStatus](#grpc.hugdubois.www.ServiceStatus)
    - [ServicesStatusList](#grpc.hugdubois.www.ServicesStatusList)
    - [VersionResponse](#grpc.hugdubois.www.VersionResponse)
  
    - [ServiceStatus.Status](#grpc.hugdubois.www.ServiceStatus.Status)
  
  
    - [Www](#grpc.hugdubois.www.Www)
  

- [Scalar Value Types](#scalar-value-types)



<a name="pb/www.proto"/>
<p align="right"><a href="#top">Top</a></p>

## pb/www.proto



<a name="grpc.hugdubois.www.EmptyMessage"/>

### EmptyMessage







<a name="grpc.hugdubois.www.RsvpCreationRequest"/>

### RsvpCreationRequest
RsvpCreationRequest encodes the request of a rsvp creation operation.


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| names | [string](#string) |  | names free this is a string field |
| email | [string](#string) |  | email contact valid email |
| presence | [bool](#bool) |  | presence is a boolean that indicate the people behind this rsvp are present |
| children_name_age | [string](#string) |  | names and ages of children this is a free string field |
| housing | [bool](#bool) |  | housing is boolean that indicate the people behind this rsvp use housing |
| music | [string](#string) |  | wanted music this is a free string field |
| brunch | [bool](#bool) |  | brunch is boolean that indicate the people behind this rsvp are present in sunday brunch |






<a name="grpc.hugdubois.www.RsvpCreationResponse"/>

### RsvpCreationResponse
RsvpCreationResponse encodes the result of a rsvp creation operation.


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| ok | [bool](#bool) |  | indicates whether the operation was successful |
| info | [RsvpInfo](#grpc.hugdubois.www.RsvpInfo) |  | rsvp information (unreliable if the operation failed) |






<a name="grpc.hugdubois.www.RsvpInfo"/>

### RsvpInfo
RsvpInfo encodes a rsvp.


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| uuid | [string](#string) |  | internal profile ID |
| names | [string](#string) |  | names free this is a string field |
| email | [string](#string) |  | email contact valid email |
| presence | [bool](#bool) |  | presence is a boolean that indicate the people behind this rsvp are present |
| children_name_age | [string](#string) |  | names and ages of children this is a free string field |
| housing | [bool](#bool) |  | housing is boolean that indicate the people behind this rsvp use housing |
| music | [string](#string) |  | wanted music this is a free string field |
| brunch | [bool](#bool) |  | brunch is boolean that indicate the people behind this rsvp are present in sunday brunch |
| created_at | [string](#string) |  | creation time (UTC - RFC 3339 format) |
| updated_at | [string](#string) |  | modification time (UTC - RFC 3339 format) |
| deleted_at | [string](#string) |  | deletion time (UTC - RFC 3339 format if the profile was logically deleted, empty otherwise) |






<a name="grpc.hugdubois.www.ServiceStatus"/>

### ServiceStatus
SeviceStatus represents a sub services status message


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| name | [string](#string) |  | name of service |
| version | [string](#string) |  | version of service |
| status | [ServiceStatus.Status](#grpc.hugdubois.www.ServiceStatus.Status) |  | status of service see enum Status |
| e_msg | [string](#string) |  |  |






<a name="grpc.hugdubois.www.ServicesStatusList"/>

### ServicesStatusList
ServicesStatusList is the sub services status list


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| services | [ServiceStatus](#grpc.hugdubois.www.ServiceStatus) | repeated |  |






<a name="grpc.hugdubois.www.VersionResponse"/>

### VersionResponse
VersionMessage represents a version message


| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| name | [string](#string) |  | Id represents the message identifier. |
| version | [string](#string) |  |  |





 


<a name="grpc.hugdubois.www.ServiceStatus.Status"/>

### ServiceStatus.Status


| Name | Number | Description |
| ---- | ------ | ----------- |
| OK | 0 |  |
| UNAVAILABLE | 1 |  |


 

 


<a name="grpc.hugdubois.www.Www"/>

### Www


| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| Version | [EmptyMessage](#grpc.hugdubois.www.EmptyMessage) | [VersionResponse](#grpc.hugdubois.www.EmptyMessage) | Version method receives no paramaters and returns a version message. |
| ServicesStatus | [EmptyMessage](#grpc.hugdubois.www.EmptyMessage) | [ServicesStatusList](#grpc.hugdubois.www.EmptyMessage) | ServicesStatus method receives no paramaters and returns all services status message |
| RsvpCreation | [RsvpCreationRequest](#grpc.hugdubois.www.RsvpCreationRequest) | [RsvpCreationResponse](#grpc.hugdubois.www.RsvpCreationRequest) | RsvpCreation attempts to create a new rsvp. |

 



## Scalar Value Types

| .proto Type | Notes | C++ Type | Java Type | Python Type |
| ----------- | ----- | -------- | --------- | ----------- |
| <a name="double" /> double |  | double | double | float |
| <a name="float" /> float |  | float | float | float |
| <a name="int32" /> int32 | Uses variable-length encoding. Inefficient for encoding negative numbers – if your field is likely to have negative values, use sint32 instead. | int32 | int | int |
| <a name="int64" /> int64 | Uses variable-length encoding. Inefficient for encoding negative numbers – if your field is likely to have negative values, use sint64 instead. | int64 | long | int/long |
| <a name="uint32" /> uint32 | Uses variable-length encoding. | uint32 | int | int/long |
| <a name="uint64" /> uint64 | Uses variable-length encoding. | uint64 | long | int/long |
| <a name="sint32" /> sint32 | Uses variable-length encoding. Signed int value. These more efficiently encode negative numbers than regular int32s. | int32 | int | int |
| <a name="sint64" /> sint64 | Uses variable-length encoding. Signed int value. These more efficiently encode negative numbers than regular int64s. | int64 | long | int/long |
| <a name="fixed32" /> fixed32 | Always four bytes. More efficient than uint32 if values are often greater than 2^28. | uint32 | int | int |
| <a name="fixed64" /> fixed64 | Always eight bytes. More efficient than uint64 if values are often greater than 2^56. | uint64 | long | int/long |
| <a name="sfixed32" /> sfixed32 | Always four bytes. | int32 | int | int |
| <a name="sfixed64" /> sfixed64 | Always eight bytes. | int64 | long | int/long |
| <a name="bool" /> bool |  | bool | boolean | boolean |
| <a name="string" /> string | A string must always contain UTF-8 encoded or 7-bit ASCII text. | string | String | str/unicode |
| <a name="bytes" /> bytes | May contain any arbitrary sequence of bytes. | string | ByteString | str |

