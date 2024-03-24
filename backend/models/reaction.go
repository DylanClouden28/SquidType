package models

type Reaction struct {
	Username  string `bson:"username" json:"username"`
	Emoji     string `bson:"emoji" json:"emoji"`
	MessageId string `bson:"message_id" json:"message_id"`
}
