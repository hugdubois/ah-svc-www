module Request.Www exposing (..)

import Pb.Www exposing (..)
import Http
import HttpBuilder exposing (RequestBuilder, withExpect, withQueryParams)
import Request.Helpers exposing (apiUrl)


--import RemoteData exposing (RemoteData(..), WebData)
--import RemoteData.Http
--import Data.AuthToken exposing (AuthToken, withAuthorization)
--import Json.Decode as Decode


version : Http.Request VersionResponse
version =
    apiUrl "version"
        |> HttpBuilder.get
        |> HttpBuilder.withExpect (Http.expectJson versionResponseDecoder)
        --|> withAuthorization maybeToken
        |> HttpBuilder.toRequest


servicesStatus =
    apiUrl "services_status"
        |> HttpBuilder.get
        |> HttpBuilder.withExpect (Http.expectJson versionResponseDecoder)
        --|> withAuthorization maybeToken
        |> HttpBuilder.toRequest


rsvpCreation : RsvpCreationRequest -> Http.Request RsvpCreationResponse
rsvpCreation rsvpCreationRequest =
    apiUrl "rsvp_creation"
        |> HttpBuilder.post
        |> HttpBuilder.withBody (Http.jsonBody (rsvpCreationRequestEncoder rsvpCreationRequest))
        |> HttpBuilder.withExpect (Http.expectJson rsvpCreationResponseDecoder)
        --|> withAuthorization maybeToken
        |> HttpBuilder.toRequest
