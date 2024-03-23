package models

import (
	"encoding/json"
)

func UnmarshalUserJSON(data []byte) (User, error) {
	var r User
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *User) MarshalJSON() ([]byte, error) {
	return json.Marshal(r)
}

type User struct {
	Username string `bson:"username" json:"username"`
	Password string `bson:"password" json:"password"`
	Token    string `bson:"token" json:"token"`
}
