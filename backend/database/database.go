package database

import (
	"context"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client

func Collection(collection string) *mongo.Collection {
	if client == nil {
		clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
		var err error
		client, err = mongo.Connect(context.TODO(), clientOptions)
		if err != nil {
			panic(err)
		}
	}
	return client.Database("whateversFine").Collection(collection)
}
