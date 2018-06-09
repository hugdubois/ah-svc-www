package service

import (
	"errors"

	"github.com/gogo/protobuf/proto"
	"golang.org/x/net/context"

	gomeetContext "github.com/gomeet/gomeet/utils/context"
	"github.com/gomeet/gomeet/utils/jwt"
	"github.com/gomeet/gomeet/utils/log"
)

func (s *wwwServer) AuthFuncOverride(ctx context.Context, fullMethodName string) (context.Context, error) {
	lFields := log.Fields{"fullMethodName": fullMethodName}
	log.Debug(ctx, "AuthFuncOverride call", lFields)

	newCtx, err := gomeetContext.ParseJWTFromContext(ctx, s.jwtSecret)
	if err != nil {
		if s.jwtSecret == "" ||
			fullMethodName == "/grpc.hugdubois.www.Www/Version" ||
			fullMethodName == "/grpc.hugdubois.www.Www/ServicesStatus" {
			return ctx, nil
		}

		log.Error(ctx, "Authentication failed", err, log.Fields{})

		return nil, err
	}

	return newCtx, nil
}

func (s *wwwServer) AclFuncOverride(ctx context.Context, fullMethodName string, msg proto.Message) error {
	lFields := log.Fields{"fullMethodName": fullMethodName}
	log.Debug(ctx, "AclFuncOverride call", lFields)

	// return an error `errors.New("Error message")` to prevent the user from accessing this request
	if s.jwtSecret == "" ||
		fullMethodName == "/grpc.hugdubois.www.Www/Version" ||
		fullMethodName == "/grpc.hugdubois.www.Www/ServicesStatus" {
		return nil
	}

	jwtClaims, ok := ctx.Value("jwt").(jwt.Claims)
	if !ok {
		return errors.New("Invalid jwt")
	}

	lFields["jwtClaims"] = jwtClaims
	log.Debug(ctx, "AclFuncOverride call - allowed", lFields)

	// here the user is allowed from accessing this request
	return nil
}
