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
import Pb.Www exposing (RsvpCreationRequest, RsvpCreationResponse, RsvpInfo)
import Regex
import Request.Www
import RemoteData exposing (WebData)
import String exposing (isEmpty)
import Task
import Validate exposing (Validator, ifFalse, ifBlank, ifInvalidEmail, validate)


type alias Error =
    ( Field, String )


type Field
    = Names
    | Email
    | ChildrenNameAge
    | Music
    | GlobalError


rsvpValidator : Validator ( Field, String ) RsvpCreationRequest
rsvpValidator =
    Validate.all
        [ Validate.firstError
            [ ifBlank .names ( Names, "Vos noms et prenoms sont obligatoire" )
            , ifFalse (\subject -> 2 < (String.length subject.names)) ( Names, "Au moins trois caractéres" )
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
    , rsvpResponse : WebData RsvpCreationResponse
    , errors : List Error
    , displayEmailError : Bool
    , displayNamesError : Bool
    , displayChildrenNameAgeError : Bool
    , displayMusicError : Bool
    }


defaultModel : Model
defaultModel =
    { mdc = Material.defaultModel
    , rsvp = defaultRsvp
    , rsvpResponse = RemoteData.NotAsked
    , errors = []
    , displayNamesError = False
    , displayEmailError = False
    , displayChildrenNameAgeError = False
    , displayMusicError = False
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
    | NamesChange String
    | EmailChange String
    | ChildrenNameAgeChange String
    | MusicChange String
    | RsvpCreation (WebData RsvpCreationResponse)


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
                        ! []

            NamesChange names ->
                let
                    newRsvp =
                        { rsvp | names = names }
                in
                    { model
                        | rsvp = newRsvp
                        , errors = validate rsvpValidator newRsvp
                        , displayNamesError = True
                    }
                        ! []

            ChildrenNameAgeChange childrenNameAge ->
                let
                    newRsvp =
                        { rsvp | childrenNameAge = childrenNameAge }
                in
                    { model
                        | rsvp = newRsvp
                        , errors = validate rsvpValidator newRsvp
                        , displayChildrenNameAgeError = True
                    }
                        ! []

            MusicChange music ->
                let
                    newRsvp =
                        { rsvp | music = music }
                in
                    { model
                        | rsvp = newRsvp
                        , errors = validate rsvpValidator newRsvp
                        , displayMusicError = True
                    }
                        ! []

            Toogle toogler ->
                case toogler of
                    Presence ->
                        { model
                            | rsvp = { rsvp | presence = not rsvp.presence }
                        }
                            ! []

                    Housing ->
                        { model
                            | rsvp = { rsvp | housing = not rsvp.housing }
                        }
                            ! []

                    Brunch ->
                        { model
                            | rsvp = { rsvp | brunch = not rsvp.brunch }
                        }
                            ! []

            RsvpCreation rsvpResponse ->
                let
                    errors =
                        case rsvpResponse of
                            RemoteData.Failure error ->
                                errorServerToErrors (Debug.log "errors" error)

                            _ ->
                                []
                in
                    { model
                        | rsvpResponse = rsvpResponse
                        , errors = errors
                    }
                        ! []

            Submit ->
                case validate rsvpValidator rsvp of
                    [] ->
                        model
                            ! [ Request.Www.rsvpCreation rsvp
                                    |> Task.perform RsvpCreation
                              ]

                    errors ->
                        { model
                            | errors = errors
                            , displayNamesError = True
                            , displayEmailError = True
                        }
                            ! []


errorServerToErrors : Http.Error -> List Error
errorServerToErrors error =
    case error of
        Http.BadStatus e ->
            List.concat
                [ errorServerToError e.body Names "de 3 à 255 caractéres"
                , errorServerToError e.body Email "un email valide"
                , errorServerToError e.body ChildrenNameAge "pas plus 255 caractéres"
                , errorServerToError e.body Music "pas plus 255 caractéres"
                ]

        Http.NetworkError ->
            [ ( GlobalError, "Une erreur réseaux est survenue essayer plus tard" ) ]

        _ ->
            [ ( GlobalError, "Une erreur inconnue est survenue contactez-nous par un autre moyen" ) ]


errorServerToError : String -> Field -> String -> List Error
errorServerToError error field msg =
    let
        pattern =
            "invalid field "
                ++ (toString field)
                |> Regex.regex
    in
        if Regex.contains pattern error then
            [ ( field, msg ) ]
        else
            []


view : Model -> Html Msg
view model =
    case model.rsvpResponse of
        RemoteData.Success rsvpResponse ->
            viewConfirm rsvpResponse

        RemoteData.Loading ->
            viewWrapper model True

        _ ->
            viewWrapper model False


viewWrapper : Model -> Bool -> Html Msg
viewWrapper model isLoading =
    styled Html.div
        [ css "position" "relative"
        , css "display" "block"
        , css "padding" "0px 5px"
        ]
        [ viewNames model
        , viewEmail model
        , viewPresence model
        , if model.rsvp.presence then
            viewHere model
          else
            viewNotHereMsg
        , viewSubmit model isLoading
        ]


viewHere : Model -> Html Msg
viewHere model =
    Html.div
        []
        [ viewChildrenNameAge model
        , viewHousing model
        , viewMusic model
        , viewBrunch model
        ]


viewNotHereMsg : Html Msg
viewNotHereMsg =
    styled Html.div
        [ css "position" "relative"
        , css "display" "block"
        , css "margin" "40px 5px"
        , css "text-align" "center"
        , css "height" "40px"
        , css "color" "rgba(0, 0, 0, 0.6)"
        , css "font-size" "20px"
        , Typography.title
        , Typography.adjustMargin
        ]
        [ text "Quel dommage on se faisait une joie de votre présence." ]


viewAgenda : Html Msg
viewAgenda =
    styled Html.div
        [ css "position" "relative"
        , css "display" "block"
        , css "margin" "40px 5px"
        , css "text-align" "center"
        , css "height" "40px"
        , css "color" "rgba(0, 0, 0, 0.6)"
        , css "font-size" "20px"
        , Typography.title
        , Typography.adjustMargin
        ]
        [ text "Nous sommes impatients de vous voir le 08.09.18." ]


viewGlobalError : Html Msg
viewGlobalError =
    styled Html.div
        [ css "position" "relative"
        , css "display" "block"
        , css "margin" "40px 5px"
        , css "text-align" "center"
        , css "height" "40px"
        , css "border-color" "#d32f2f"
        , css "border-top" "15px solid #d32f2f"
        , css "color" "#d32f2f"
        , css "font-size" "20px"
        , Typography.title
        , Typography.adjustMargin
        ]
        [ text "Une erreur s'est produite veuillez recharger la page" ]


viewConfirm : RsvpCreationResponse -> Html Msg
viewConfirm rsvpResponse =
    case rsvpResponse.info of
        Just info ->
            if info.presence then
                viewAgenda
            else
                viewNotHereMsg

        _ ->
            viewGlobalError


viewSubmit : Model -> Bool -> Html Msg
viewSubmit model isLoading =
    if hasError GlobalError model.errors then
        viewGlobalError
    else
        FormField.view
            [ css "position" "relative"
            , css "display" "block"
            ]
            [ Button.view Mdc
                "btn-send"
                model.mdc
                [ Button.ripple
                , Button.raised
                , Options.onClick Submit |> when (not isLoading)
                , css "position" "relative"
                , css "display" "block"
                , css "margin" "30px auto"
                ]
                [ text "Envoyer" ]
            ]


viewEmail : Model -> Html Msg
viewEmail model =
    let
        invalid =
            model.displayEmailError && hasError Email model.errors
    in
        FormField.view
            [ css "position" "relative"
            , css "display" "block"
            ]
            [ Textfield.view Mdc
                "txt-email"
                model.mdc
                [ Textfield.label "Une addresse email"
                , Textfield.required
                , Textfield.pattern "^[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
                , Options.onInput EmailChange
                , Textfield.value model.rsvp.email
                , css "width" "100%"
                , Textfield.invalid |> when invalid
                ]
                []
            , Textfield.helperText
                [ Textfield.persistent
                , Textfield.validationMsg
                , css "display" "none" |> when (not invalid)
                ]
                [ Html.text <| errorMsg Email model.errors
                ]
            ]


viewNames : Model -> Html Msg
viewNames model =
    let
        invalid =
            model.displayNamesError && hasError Names model.errors
    in
        FormField.view
            [ css "position" "relative"
            , css "display" "block"
            ]
            [ Textfield.view Mdc
                "txt-names"
                model.mdc
                [ Textfield.label "Vos noms et prenoms"
                , Textfield.required
                , Textfield.pattern ".{3,}"
                , Options.onInput NamesChange
                , Textfield.value model.rsvp.names
                , css "width" "100%"
                , Textfield.invalid |> when invalid
                ]
                []
            , Textfield.helperText
                [ Textfield.persistent
                , Textfield.validationMsg
                , css "display" "none" |> when (not invalid)
                ]
                [ Html.text <| errorMsg Names model.errors
                ]
            ]


viewChildrenNameAge : Model -> Html Msg
viewChildrenNameAge model =
    let
        invalid =
            model.displayChildrenNameAgeError && hasError ChildrenNameAge model.errors
    in
        FormField.view
            [ css "position" "relative"
            , css "display" "block"
            ]
            [ Textfield.view Mdc
                "txt-children-name-age"
                model.mdc
                [ Textfield.label "Prenoms et ages des enfants"
                , Options.onInput ChildrenNameAgeChange
                , Textfield.value model.rsvp.childrenNameAge
                , css "width" "100%"
                , Textfield.invalid |> when invalid
                ]
                []
            , Textfield.helperText
                [ Textfield.persistent
                , Textfield.validationMsg
                , css "display" "none" |> when (not invalid)
                ]
                [ Html.text <| errorMsg ChildrenNameAge model.errors
                ]
            ]


viewMusic : Model -> Html Msg
viewMusic model =
    let
        invalid =
            model.displayMusicError && hasError Music model.errors
    in
        FormField.view
            [ css "position" "relative"
            , css "display" "block"
            , css "margin-top" "16px"
            ]
            [ Textfield.view Mdc
                "display-music"
                model.mdc
                [ Textfield.label "Sur quel morceau souhaitez-vous danser?"
                , Options.onInput MusicChange
                , Textfield.value model.rsvp.music
                , css "width" "100%"
                , Textfield.invalid |> when invalid
                ]
                []
            , Textfield.helperText
                [ Textfield.persistent
                , Textfield.validationMsg
                , css "display" "none" |> when (not invalid)
                ]
                [ Html.text <| errorMsg Music model.errors
                ]
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
                "txt-presence"
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
                "txt-housing"
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
                "txt-brunch"
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
