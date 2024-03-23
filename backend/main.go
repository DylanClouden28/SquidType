package main

import (
	//"net/http"
	"context"
	"sluggers/controller"

	"github.com/gin-gonic/gin"

	//"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client

func Collection(collection string) *mongo.Collection {
	return client.Database("whateversFine").Collection(collection)
}

func main() {
	r := gin.Default()
	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
	var err error
	client, err = mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		panic(err)
	}
	controller.Route(r)
	r.Run(":8000")
}
