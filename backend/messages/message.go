package messages

import (
	"context"
	"fmt"
	"sluggers/database"
	"sluggers/models"
	"time"

	"github.com/google/uuid"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	// "go.mongodb.org/mongo-driver/mongo"
)

func Route(router *gin.Engine) {
	message := router.Group("/api/message")
	{
		message.GET("/get-messages", getMessages)
	}
}

func getMessages(c *gin.Context) {
	messages := make([]models.Message, 0)
	collection := database.Collection("messages")
	curr, err := collection.Find(context.TODO(), bson.D{})
	if err != nil {
		fmt.Println("error", err)
		c.JSON(500, "Error loading messages")
		return
	}
	for curr.Next(context.TODO()) {
		var message models.Message
		err := curr.Decode(&message)
		if err != nil {
			fmt.Println(err)
			c.JSON(500, "Error loading messages")
			return
		}
		messages = append(messages, message)
	}
	c.JSON(200, messages)

}

func SendMessage(username string, newMessage string) models.Message {
	/*logged_in, user := controller.Auth(c)
	if !logged_in {
		c.JSON(403, "Not logged in")
		return
	}*/
	var message models.Message
	message.Content = newMessage
	message.Date = primitive.NewDateTimeFromTime(time.Now().UTC())
	message.User = username
	messages := database.Collection("messages")
	message.ID = uuid.New().String()
	message.Reaction = make([]models.Reaction, 0)
	messages.InsertOne(context.TODO(), message)
	return message
}

func SendEmoji(reaction models.Reaction) {
	filter := bson.D{{"uuid", reaction.MessageId}}
	/*var message models.Message
		messages := database.Collection("messages")
		mess_err := messages.FindOne(context.TODO(), filter).Decode(&message)
		if mess_err != nil {
			c.JSON(400, "No such message")
			return
		}
	  message.Reaction = append(message.Reaction, emoji)*/
	messages := database.Collection("messages")

	update := bson.D{{"$push", bson.D{{"reaction", reaction}}}}
	result, update_err := messages.UpdateOne(context.TODO(), filter, update)
	if update_err != nil {
		fmt.Println("error adding emoji", result, update_err)
	}
}
