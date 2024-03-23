package main

import (
	//"net/http"
	"context"
	"github.com/gin-gonic/gin"
	"sluggers/controller"

	//"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client

func collection(collection string) *mongo.Collection {
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
