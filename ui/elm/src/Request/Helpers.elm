module Request.Helpers exposing (apiUrl)


apiUrl : String -> String
apiUrl str =
    "/api/v1/" ++ str
