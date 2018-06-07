module Main exposing (..)

import Html exposing (Html, text)
import Html.Attributes exposing (style)
import Material
import Material.Button as Button
import Material.FormField as FormField
import Material.RadioButton as RadioButton
import Material.Switch as Switch
import Material.Textfield as Textfield
import Material.Textfield.HelperText as Textfield
import Material.Options as Options exposing (when, styled, cs, css)


type alias Model =
    { mdc : Material.Model Msg
    , presence : Bool
    , housing : Bool
    , brunch : Bool
    }


defaultModel : Model
defaultModel =
    { mdc = Material.defaultModel
    , presence = True
    , housing = True
    , brunch = True
    }


type Msg
    = Mdc (Material.Msg Msg)
    | Click


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
    case msg of
        Mdc msg_ ->
            Material.update Mdc msg_ model

        Click ->
            ( model, Cmd.none )


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
        , viewTxtChildrenNameAge model
        , viewHousing model
        , viewTxtMusic model
        , viewBrunch model
        , viewBtnSubmit model
        ]


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
            , Options.onClick Click
            , css "float" "right"
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
            , css "width" "100%"
            ]
            []

        --, Textfield.helperText
        --[ Textfield.persistent |> when state.persistent
        --, Textfield.validationMsg |> when state.validationMsg
        --, css "display" "none" |> when (not state.helperText)
        --]
        --[ Html.text "Help Text (possibly validation message)"
        --]
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
            , css "width" "100%"
            ]
            []
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
            , css "width" "100%"
            ]
            []
        ]


viewTxtMusic : Model -> Html Msg
viewTxtMusic model =
    FormField.view
        [ css "position" "relative"
        , css "display" "block"
        ]
        [ Textfield.view Mdc
            [ 4 ]
            model.mdc
            [ Textfield.label "Sur quel morceau souhaitez-vous danser?"
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
            [ text "On vous compte parmi nous?" ]
        , FormField.view []
            [ Switch.view Mdc
                [ 5 ]
                model.mdc
                [ Switch.on |> when model.presence
                ]
                []
            , styled Html.label
                [ css "font-size" "16px"
                , css "color" "rgba(0, 0, 0, 0.6)"
                ]
                [ text "Oui"

                -- text "Non désolé"
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
                [ Switch.on |> when model.housing
                ]
                []
            , styled Html.label
                [ css "font-size" "16px"
                , css "color" "rgba(0, 0, 0, 0.6)"
                ]
                [ --text "Non je me débrouille par moi même"
                  text "Oui ça m'intéresse"
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
                [ Switch.on |> when model.brunch
                ]
                []
            , styled Html.label
                [ css "font-size" "16px"
                , css "color" "rgba(0, 0, 0, 0.6)"
                ]
                [ --text "Non je me casse"
                  text "Oui je serais là"
                ]
            ]
        ]
