package service

import (
	"time"

	"github.com/hugdubois/ah-svc-www/models"
	pb "github.com/hugdubois/ah-svc-www/pb"
)

const (
	defaultPageSize = 50
)

func convertRsvpFromModelToProtocol(dbRsvp *models.Rsvp) *pb.RsvpInfo {
	var (
		deletedAt string
	)

	if dbRsvp.DeletedAt != nil {
		deletedAt = dbRsvp.DeletedAt.UTC().Format(time.RFC3339)
	}

	return &pb.RsvpInfo{
		Uuid:            dbRsvp.UUID.String(),
		Names:           dbRsvp.Names,
		Email:           dbRsvp.Email,
		Presence:        dbRsvp.Presence,
		ChildrenNameAge: dbRsvp.ChildrenNameAge,
		Housing:         dbRsvp.Housing,
		Music:           dbRsvp.Music,
		Brunch:          dbRsvp.Brunch,
		CreatedAt:       dbRsvp.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt:       dbRsvp.UpdatedAt.UTC().Format(time.RFC3339),
		DeletedAt:       deletedAt,
	}
}
