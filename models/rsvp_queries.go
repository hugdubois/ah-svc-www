package models

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jinzhu/gorm"
)

func castRsvpParams(
	names string, email string, presence bool, childrenNameAge string, housing bool, music string, brunch bool,
) (
	error, *string, *string, *bool, *string, *bool, *string, *bool,
) {
	if len(names) < 3 {
		return fmt.Errorf("invalid field Names: value '%s' must length be greater than '2'", names), nil, nil, nil, nil, nil, nil, nil
	}
	if len(names) > 255 {
		return fmt.Errorf("invalid field Names: value '%s' must length be less than '256'", names), nil, nil, nil, nil, nil, nil, nil
	}
	if len(childrenNameAge) > 255 {
		return fmt.Errorf("invalid field ChildrenNameAge: value '%s' must length be less than '256'", childrenNameAge), nil, nil, nil, nil, nil, nil, nil
	}
	if len(music) > 255 {
		return fmt.Errorf("invalid field Music: value '%s' must length be less than '256'", music), nil, nil, nil, nil, nil, nil, nil
	}

	return nil, &names, &email, &presence, &childrenNameAge, &housing, &music, &brunch
}

// CreateRsvp inserts a new rsvp in the table.
func CreateRsvp(
	db *gorm.DB, names string, email string, presence bool, childrenNameAge string, housing bool, music string, brunch bool,
) (*Rsvp, error) {
	err, cNames, cEmail, cPresence, cChildrenNameAge, cHousing, cMusic, cBrunch := castRsvpParams(names, email, presence, childrenNameAge, housing, music, brunch)
	if err != nil {
		return nil, err
	}
	rsvp := &Rsvp{
		Names:           *cNames,
		Email:           *cEmail,
		Presence:        *cPresence,
		ChildrenNameAge: *cChildrenNameAge,
		Housing:         *cHousing,
		Music:           *cMusic,
		Brunch:          *cBrunch,
	}

	err = db.Create(rsvp).Error

	return rsvp, err
}

// FindRsvpByUUID returns the existing rsvp with the specified UUID.
func FindRsvpByUUID(db *gorm.DB, sUuid string) (*Rsvp, error) {
	uuid, err := uuid.Parse(sUuid)
	if err != nil {
		return nil, fmt.Errorf("%s bad UUID %s", sUuid, err)
	}

	rsvp := &Rsvp{
		UUID: uuid,
	}

	// Unscoped() enables the retrieval of logically-deleted rows
	if db.Unscoped().First(rsvp).RecordNotFound() {
		return nil, fmt.Errorf("cannot find rsvp UUID %s", sUuid)
	}

	return rsvp, nil
}

// ListRsvps returns a list of rsvps matching a set of criteria.
func ListRsvps(db *gorm.DB, offset uint, limit uint, order string, criteria map[string]interface{}, excludeSoftDeleted bool, softDeletedOnly bool) ([]Rsvp, uint, bool, error) {
	var (
		rsvps         []Rsvp
		resultSetSize int
	)

	// Unscoped() enables the retrieval of logically-deleted rows
	db = db.Unscoped().Limit(limit).Offset(offset).Order(order).Where(criteria)

	if excludeSoftDeleted && softDeletedOnly {
		return rsvps, 0, false, errors.New("excludeSoftDeleted and softDeletedOnly are true")
	}

	if excludeSoftDeleted {
		db = db.Where("deleted_at IS NULL")
	} else if softDeletedOnly {
		db = db.Where("deleted_at IS NOT NULL")
	}

	db = db.Find(&rsvps)
	err := db.Error

	// the offset must be cancelled to get the total count
	db.Offset(-1).Count(&resultSetSize)
	hasMore := false
	if int(offset)+len(rsvps) < resultSetSize {
		hasMore = true
	}

	return rsvps, uint(resultSetSize), hasMore, err
}

// UpdateRsvp updates the existing rsvp with the specified UUID using the modifications
// provided in the map argument.
func UpdateRsvp(
	db *gorm.DB, sUuid string, names string, email string, presence bool, childrenNameAge string, housing bool, music string, brunch bool,
) (*Rsvp, error) {
	uuid, err := uuid.Parse(sUuid)
	if err != nil {
		return nil, fmt.Errorf("%s bad UUID %s", sUuid, err)
	}

	err, cNames, cEmail, cPresence, cChildrenNameAge, cHousing, cMusic, cBrunch := castRsvpParams(names, email, presence, childrenNameAge, housing, music, brunch)
	if err != nil {
		return nil, err
	}

	// set changes fields
	changes := map[string]interface{}{
		"names":             cNames,
		"email":             cEmail,
		"presence":          cPresence,
		"children_name_age": cChildrenNameAge,
		"housing":           cHousing,
		"music":             cMusic,
		"brunch":            cBrunch,
	}

	rsvp := &Rsvp{
		UUID: uuid,
	}

	// Unscoped() enables the retrieval of logically-deleted rows
	if db.Unscoped().First(rsvp).RecordNotFound() {
		return nil, fmt.Errorf("cannot find rsvp UUID %s", sUuid)
	}

	err = db.Model(rsvp).Updates(changes).Error

	return rsvp, err
}

// DeleteRsvpLogically performs the logical deletion of the rsvp with the specified ID.
func DeleteRsvpLogically(db *gorm.DB, sUuid string) (*Rsvp, error) {
	var rsvp *Rsvp

	uuid, err := uuid.Parse(sUuid)
	if err != nil {
		return nil, fmt.Errorf("%s bad UUID %s", sUuid, err)
	}

	rsvp = &Rsvp{
		UUID: uuid,
	}

	// Unscoped() enables the retrieval of logically-deleted rows
	if db.First(rsvp).RecordNotFound() {
		return nil, fmt.Errorf("cannot find rsvp UUID %s", sUuid)
	}

	err = db.Set("gorm:delete_option", "LIMIT 1").Delete(rsvp).Error
	if err == nil && rsvp.DeletedAt == nil {
		t := time.Now()
		rsvp.DeletedAt = &t
	}

	return rsvp, err
}

// DeleteRsvpPhysically performs the physical deletion of the device with the specified ID.
func DeleteRsvpPhysically(db *gorm.DB, sUuid string) error {
	if _, err := uuid.Parse(sUuid); err != nil {
		return fmt.Errorf("%s bad UUID %s", sUuid, err)
	}

	return db.Exec("DELETE FROM rsvps WHERE uuid = ? LIMIT 1", sUuid).Error
}
