package messages

import (
	"context"
	"fmt"
	"sluggers/controller"
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
	message := router.Group("/message")
	{
		message.GET("/get-messages", getMessages)
		message.POST("/send-message", sendMessage)
		message.POST("/send-emoji", sendEmoji)
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

func sendMessage(c *gin.Context) {
	logged_in, user := controller.Auth(c)
	if !logged_in {
		c.JSON(403, "Not logged in")
		return
	}
	var message models.Message
	err := c.BindJSON(&message)
	if err != nil {
		c.JSON(500, "Cant read message")
		return
	}
	message.Date = primitive.NewDateTimeFromTime(time.Now().UTC())
	message.User = user
	messages := database.Collection("messages")
	message.ID = uuid.New().String()
	message.Reaction = make([]models.Reaction, 0)
	messages.InsertOne(context.TODO(), message)
	c.JSON(200, "message received")

}

func sendEmoji(c *gin.Context) {
	logged_in, user := controller.Auth(c)
	if !logged_in {
		c.JSON(403, "Not logged in")
		return
	}
	var emoji models.Reaction
	err := c.BindJSON(&emoji)
	fmt.Println(emoji)
	if err != nil {
		c.JSON(500, "Cant read emoji")
		return
	}
	fmt.Println("Emoji input", emoji)
	emoji.Username = user
	message_id := emoji.MessageId
	filter := bson.D{{"uuid", message_id}}
	/*var message models.Message
		messages := database.Collection("messages")
		mess_err := messages.FindOne(context.TODO(), filter).Decode(&message)
		if mess_err != nil {
			c.JSON(400, "No such message")
			return
		}
	  message.Reaction = append(message.Reaction, emoji)*/
	messages := database.Collection("messages")

	update := bson.D{{"$push", bson.D{{"reaction", emoji}}}}
	result, update_err := messages.UpdateOne(context.TODO(), filter, update)
	fmt.Println(result)
	if update_err != nil {
		c.JSON(400, "Error adding emoji")
		return
	}
	c.JSON(200, "success")
}
