package messages

import (
	"context"
	"github.com/google/uuid"
	"sluggers/controller"
	"sluggers/database"
	"sluggers/models"
	"time"

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
	curr, err := collection.Find(context.TODO(), bson.D{{}})
	if err != nil {
		c.JSON(500, "Error loading messages")
		return
	}
	for curr.Next(context.TODO()) {
		var message models.Message
		err := curr.Decode(*&message)
		if err != nil {
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
	messages.InsertOne(context.TODO(), message)
	message.ID = uuid.New().String()
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
	if err != nil {
		c.JSON(500, "Cant read emoji")
		return
	}
	emoji.Username = user
	message_id := emoji.MessageId
	filter := bson.D{{"message", message_id}}
	var message models.Message
	messages := database.Collection("messages")
	mess_err := messages.FindOne(context.TODO(), filter).Decode(&message)
	if mess_err != nil {
		c.JSON(400, "No such message")
		return
	}
	emojis := database.Collection("emojis")
	emojis.InsertOne(context.TODO(), emoji)
	c.JSON(200, "success")
}
