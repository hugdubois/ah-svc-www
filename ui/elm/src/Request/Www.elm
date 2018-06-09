module Request.Www exposing (..)

import Pb.Www exposing (..)
import Http
import HttpBuilder exposing (RequestBuilder, withExpect, withQueryParams)
import Request.Helpers exposing (apiUrl)
import RemoteData exposing (WebData)
import Task


--import RemoteData exposing (RemoteData(..), WebData)
--import Data.AuthToken exposing (AuthToken, withAuthorization)
--version : Task.Task Never (RemoteData.RemoteData Http.Error VersionResponse)


version : Task.Task Never (WebData VersionResponse)
version =
    apiUrl "version"
        |> HttpBuilder.get
        |> HttpBuilder.withExpect (Http.expectJson versionResponseDecoder)
        --|> withAuthorization maybeToken
        |> HttpBuilder.toTask
        |> RemoteData.fromTask


servicesStatus : Task.Task Never (WebData ServiceStatus)
servicesStatus =
    apiUrl "services_status"
        |> HttpBuilder.get
        |> HttpBuilder.withExpect (Http.expectJson serviceStatusDecoder)
        --|> withAuthorization maybeToken
        |> HttpBuilder.toTask
        |> RemoteData.fromTask


rsvpCreation : RsvpCreationRequest -> Task.Task Never (WebData RsvpCreationResponse)
rsvpCreation rsvpCreationRequest =
    apiUrl "rsvp_creation"
        |> HttpBuilder.post
        |> HttpBuilder.withBody (Http.jsonBody (rsvpCreationRequestEncoder rsvpCreationRequest))
        |> HttpBuilder.withExpect (Http.expectJson rsvpCreationResponseDecoder)
        --|> withAuthorization maybeToken
        |> HttpBuilder.toTask
        |> RemoteData.fromTask
