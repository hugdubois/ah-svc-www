module Main exposing (..)

import Debug
import Html exposing (Html, text)
import Html.Attributes exposing (style)
import Http
import List exposing (filter, length)
import Material
import Material.Button as Button
import Material.FormField as FormField
import Material.RadioButton as RadioButton
import Material.Switch as Switch
import Material.Textfield as Textfield
import Material.Textfield.HelperText as Textfield
import Material.Typography as Typography
import Material.Options as Options exposing (when, styled, cs, css)
import Pb.Www exposing (RsvpCreationRequest, RsvpCreationResponse)
import Request.Www
import RemoteData
import String exposing (isEmpty)
import Validate exposing (Validator, ifFalse, ifBlank, ifInvalidEmail, validate)


(=>) : a -> b -> ( a, b )
(=>) =
    (,)


type alias Error =
    ( Field, String )


type Field
    = Name
    | Email


rsvpValidator : Validator ( Field, String ) RsvpCreationRequest
rsvpValidator =
    Validate.all
        [ Validate.firstError
            [ ifBlank .names ( Name, "Vos noms et prenoms sont obligatoire" )
            , ifFalse (\subject -> 2 < (String.length subject.names)) ( Name, "Au moins trois caractéres" )
            ]
        , Validate.firstError
            [ ifBlank .email ( Email, "Un email est obligatoire" )
            , ifInvalidEmail .email (\_ -> ( Email, "Invalide email" ))
            ]
        ]


errorMsg : Field -> List Error -> String
errorMsg field errors =
    List.filter (\( f, _ ) -> f == field) errors
        |> List.map (\( _, e ) -> e ++ " ")
        |> String.concat


hasError : Field -> List Error -> Bool
hasError field errors =
    List.filter (\( f, _ ) -> f == field) errors
        |> List.isEmpty
        |> not


type alias Model =
    { mdc : Material.Model Msg
    , rsvp : RsvpCreationRequest
    , errors : List Error
    , displayEmailError : Bool
    , displayNameError : Bool
    }


defaultModel : Model
defaultModel =
    { mdc = Material.defaultModel
    , rsvp = defaultRsvp
    , errors = []
    , displayEmailError = False
    , displayNameError = False
    }


defaultRsvp : RsvpCreationRequest
defaultRsvp =
    { email = ""
    , names = ""
    , presence = True
    , childrenNameAge = ""
    , housing = True
    , music = ""
    , brunch = True
    }


type Toogler
    = Presence
    | Housing
    | Brunch


type Msg
    = Mdc (Material.Msg Msg)
    | Submit
    | Toogle Toogler
    | EmailChange String
    | NameChange String
    | ChildrenNameAgeChange String
    | MusicChange String
    | RsvpCreation (Result Http.Error RsvpCreationResponse)


main : Program Never Model Msg
main =
    Html.program
        { init = init
        , subscriptions = subscriptions
        , update = update
        , view = view
        }


init : ( Model, Cmd Msg )
init =
    ( defaultModel, Material.init Mdc )


subscriptions : Model -> Sub Msg
subscriptions model =
    Material.subscriptions Mdc model


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    let
        rsvp =
            model.rsvp
    in
        case msg of
            Mdc msg_ ->
                Material.update Mdc msg_ model

            EmailChange email ->
                let
                    newRsvp =
                        { rsvp | email = email }
                in
                    { model
                        | rsvp = newRsvp
                        , errors = validate rsvpValidator newRsvp
                        , displayEmailError = True
                    }
                        => Cmd.none

            NameChange names ->
                let
                    newRsvp =
                        { rsvp | names = names }
                in
                    { model
                        | rsvp = newRsvp
                        , errors = validate rsvpValidator newRsvp
                        , displayNameError = True
                    }
                        => Cmd.none

            ChildrenNameAgeChange childrenNameAge ->
                let
                    newRsvp =
                        { rsvp | childrenNameAge = childrenNameAge }
                in
                    { model
                        | rsvp = newRsvp
                        , errors = validate rsvpValidator newRsvp
                    }
                        => Cmd.none

            MusicChange music ->
                let
                    newRsvp =
                        { rsvp | music = music }
                in
                    { model
                        | rsvp = newRsvp
                        , errors = validate rsvpValidator newRsvp
                    }
                        => Cmd.none

            Toogle toogler ->
                case toogler of
                    Presence ->
                        { model
                            | rsvp = { rsvp | presence = not rsvp.presence }
                        }
                            => Cmd.none

                    Housing ->
                        { model
                            | rsvp = { rsvp | housing = not rsvp.housing }
                        }
                            => Cmd.none

                    Brunch ->
                        { model
                            | rsvp = { rsvp | brunch = not rsvp.brunch }
                        }
                            => Cmd.none

            RsvpCreation (Ok response) ->
                let
                    _ =
                        Debug.log "reponse" response
                in
                    model
                        => Cmd.none

            RsvpCreation (Err error) ->
                let
                    _ =
                        Debug.log "error" error
                in
                    model
                        => Cmd.none

            Submit ->
                case validate rsvpValidator rsvp of
                    [] ->
                        model
                            => Http.send RsvpCreation (Request.Www.rsvpCreation rsvp)

                    errors ->
                        { model
                            | errors = errors
                            , displayNameError = True
                            , displayEmailError = True
                        }
                            => Cmd.none



--let
--errors =
--Debug.log "errors fields" <| validate rsvpValidator rsvp
--rsvp =
--Debug.log "rsvp" <| model.rsvp
--v =
--Debug.log "version" <| Request.Www.rsvpCreation rsvp
----Debug.log "rsvp" <| model.rsvp
--in
--model
--=> Cmd.none


view : Model -> Html Msg
view model =
    styled Html.div
        [ css "position" "relative"
        , css "display" "block"
        , css "padding" "0px 5px"
        ]
        [ viewTxtNames model
        , viewTxtEmail model
        , viewPresence model
        , if model.rsvp.presence then
            viewHere model
          else
            viewNotHereMsg model
        , viewBtnSubmit model
        ]


viewHere : Model -> Html Msg
viewHere model =
    Html.div
        []
        [ viewTxtChildrenNameAge model
        , viewHousing model
        , viewTxtMusic model
        , viewBrunch model
        ]


viewNotHereMsg : Model -> Html Msg
viewNotHereMsg model =
    styled Html.div
        [ css "position" "relative"
        , css "display" "block"
        , css "margin" "40px 5px"
        , css "text-align" "center"
        , css "height" "40px"
        , css "color" "rgba(0, 0, 0, 0.6)"
        , css "font-size" "20px"

        --, Typography.title
        --, Typography.adjustMargin
        ]
        [ text "Quel dommage on se faisait une joie de votre presence." ]


viewBtnSubmit : Model -> Html Msg
viewBtnSubmit model =
    FormField.view
        [ css "position" "relative"
        , css "display" "block"
        ]
        [ Button.view Mdc
            [ 0 ]
            model.mdc
            [ Button.ripple
            , Options.onClick Submit
            , css "position" "relative"
            , css "display" "block"
            , css "margin" "30px auto"
            ]
            [ text "Envoyer" ]
        ]


viewTxtEmail : Model -> Html Msg
viewTxtEmail model =
    FormField.view
        [ css "position" "relative"
        , css "display" "block"
        ]
        [ Textfield.view Mdc
            [ 1 ]
            model.mdc
            [ Textfield.label "Une addresse email"
            , Textfield.required
            , Textfield.pattern "^[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
            , Options.onInput EmailChange
            , Textfield.value model.rsvp.email
            , css "width" "100%"
            ]
            []
        , Textfield.helperText
            [ Textfield.persistent
            , Textfield.validationMsg
            , css "display" "none" |> when ((not model.displayEmailError) || (not <| hasError Email model.errors))
            ]
            [ Html.text <| errorMsg Email model.errors
            ]
        ]


viewTxtNames : Model -> Html Msg
viewTxtNames model =
    FormField.view
        [ css "position" "relative"
        , css "display" "block"
        ]
        [ Textfield.view Mdc
            [ 2 ]
            model.mdc
            [ Textfield.label "Vos noms et prenoms"
            , Textfield.required
            , Textfield.pattern ".{3,}"
            , Options.onInput NameChange
            , Textfield.value model.rsvp.names
            , css "width" "100%"
            ]
            []
        , Textfield.helperText
            [ Textfield.persistent
            , Textfield.validationMsg
            , css "display" "none" |> when ((not model.displayNameError) || (not <| hasError Name model.errors))
            ]
            [ Html.text <| errorMsg Name model.errors
            ]
        ]


viewTxtChildrenNameAge : Model -> Html Msg
viewTxtChildrenNameAge model =
    FormField.view
        [ css "position" "relative"
        , css "display" "block"
        ]
        [ Textfield.view Mdc
            [ 3 ]
            model.mdc
            [ Textfield.label "Prenoms et ages des enfants"
            , Options.onInput ChildrenNameAgeChange
            , Textfield.value model.rsvp.childrenNameAge
            , css "width" "100%"
            ]
            []
        ]


viewTxtMusic : Model -> Html Msg
viewTxtMusic model =
    FormField.view
        [ css "position" "relative"
        , css "display" "block"
        , css "margin-top" "16px"
        ]
        [ Textfield.view Mdc
            [ 4 ]
            model.mdc
            [ Textfield.label "Sur quel morceau souhaitez-vous danser?"
            , Options.onInput MusicChange
            , Textfield.value model.rsvp.music
            , css "width" "100%"
            ]
            []
        ]


viewPresence : Model -> Html Msg
viewPresence model =
    styled Html.div
        [ css "position" "relative"
        , css "display" "block"
        , css "padding-top" "20px"
        ]
        [ styled Html.div
            [ css "font-size" "16px"
            , css "margin-top" "12.4px"
            , css "color" "rgba(0, 0, 0, 0.6)"
            ]
            [ text "On vous compte parmi nous?*" ]
        , FormField.view []
            [ Switch.view Mdc
                [ 5 ]
                model.mdc
                [ Switch.on |> when model.rsvp.presence
                , Options.onClick (Toogle Presence)
                ]
                []
            , styled Html.label
                [ css "font-size" "16px"
                , css "color" "rgba(0, 0, 0, 0.6)"
                ]
                [ text <|
                    if model.rsvp.presence then
                        "Oui"
                    else
                        "Non désolé"
                ]
            ]
        ]


viewHousing : Model -> Html Msg
viewHousing model =
    styled Html.div
        [ css "position" "relative"
        , css "display" "block"
        , css "padding-top" "20px"
        ]
        [ styled Html.div
            [ css "font-size" "16px"
            , css "margin-top" "12.4px"
            , css "color" "rgba(0, 0, 0, 0.6)"
            ]
            [ text "On a prévu un hébergement pour vous" ]
        , FormField.view []
            [ Switch.view Mdc
                [ 6 ]
                model.mdc
                [ Switch.on |> when model.rsvp.housing
                , Options.onClick (Toogle Housing)
                ]
                []
            , styled Html.label
                [ css "font-size" "16px"
                , css "color" "rgba(0, 0, 0, 0.6)"
                ]
                [ text <|
                    if model.rsvp.housing then
                        "Oui ça m'intéresse"
                    else
                        "Non je me débrouille par moi même"
                ]
            ]
        ]


viewBrunch : Model -> Html Msg
viewBrunch model =
    styled Html.div
        [ css "position" "relative"
        , css "display" "block"
        , css "padding-top" "20px"
        ]
        [ styled Html.div
            [ css "font-size" "16px"
            , css "margin-top" "12.4px"
            , css "color" "rgba(0, 0, 0, 0.6)"
            ]
            [ text "Serez vous présent pour le Brunch du dimanche?" ]
        , FormField.view []
            [ Switch.view Mdc
                [ 7 ]
                model.mdc
                [ Switch.on |> when model.rsvp.brunch
                , Options.onClick (Toogle Brunch)
                ]
                []
            , styled Html.label
                [ css "font-size" "16px"
                , css "color" "rgba(0, 0, 0, 0.6)"
                ]
                [ text <|
                    if model.rsvp.brunch then
                        "Oui je serais là"
                    else
                        "Non je me casse à jeun"
                ]
            ]
        ]
