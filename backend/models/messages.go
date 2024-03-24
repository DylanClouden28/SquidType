package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Message struct {
	User     string             `bson:"user" json:"user"`
	Content  string             `bson:"content" json:"content"`
	Date     primitive.DateTime `bson:"date" json:"date"`
	Reaction []Reaction         `bson:"reaction" json:"reaction"`
	ID       string             `bson:"uuid" json:"uuid"`
}
