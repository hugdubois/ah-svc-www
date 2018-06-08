package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/jinzhu/gorm"
)

// don't forget you need create
// func <mysql|postgres|sqlite|mssql>Models() (values []interface{}) {}

type Rsvp struct {
	UUID            uuid.UUID `gorm:"primary_key;type:char(36);not null"`
	Names           string    `gorm:"size:255"`
	Email           string    `gorm:"type:varchar(100);index:idx_email"`
	Presence        bool      `gorm:"index:idx_is_presence"`
	ChildrenNameAge string    `gorm:"size:255"`
	Housing         bool      `gorm:"index:idx_is_housing"`
	Music           string    `gorm:"size:255"`
	Brunch          bool      `gorm:"index:idx_is_brunch"`
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       *time.Time `sql:"index"`
}

func (*Rsvp) BeforeCreate(scope *gorm.Scope) error {
	scope.SetColumn("UUID", uuid.New())
	return nil
}

// All Sqlite models
func sqliteModels() (values []interface{}) {
	values = append(values, &Rsvp{})
	return
}
