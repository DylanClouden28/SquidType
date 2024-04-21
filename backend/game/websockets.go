package game

import (
	"encoding/json"
	"fmt"
	"sluggers/controller"
	"sluggers/models"

	"github.com/gin-gonic/gin"
	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

var Clients = make([]*websocket.Conn, 0)

type baseMessage struct {
	MessageType string          `json:"messageType"`
	Data        json.RawMessage `json:"data"`
}

type testMessage struct {
	MessageType string `json:"messageType"`
	Data        struct {
		Text string `json:"text"`
	} `json:"data"`
}

type chatMessage struct {
	MessageType string `json:"messageType"`
	Data        struct {
		Message models.Message `json:"message"`
	} `json:"data"`
}

func Route(router *gin.Engine) {
	game := router.Group("/ws")
	{
		game.GET("/", websocketHandler)
	}
}

func websocketHandler(c *gin.Context) {
	context := c.Request.Context()
	isLoggedIn, _ := controller.Auth(c)
	if !isLoggedIn {
		c.JSON(400, "user not logged in")
		return
	}
	conn, err := websocket.Accept(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(500, "error starting websocket")
		return
	}
	Clients = append(Clients, conn)
	defer func() {
		Clients = removeFromSlice(Clients, conn)
		conn.Close(websocket.StatusNormalClosure, "bye bye")
	}()

	for {
		var rawMess json.RawMessage
		err := wsjson.Read(context, conn, &rawMess)
		if err != nil {
			break
		}

		var baseMess baseMessage
		err = json.Unmarshal(rawMess, &baseMess)
		if err != nil {
			fmt.Println("Error did not find messageType in rawMessage: ", string(rawMess))
			continue
		}
		fmt.Println("Recieved baseMess | type: ", baseMess.MessageType, " | rawJson: ", rawMess)

		switch baseMess.MessageType {
		case "yoyo":
			fmt.Println("Recieved yoyo")
			var testMess testMessage
			err = json.Unmarshal(rawMess, &testMess)
			if err != nil {
				fmt.Println("Error Unmarshiling")
				continue
			}

			fmt.Println("Recieved test:", testMess.Data.Text)
			wsjson.Write(context, conn, testMessage{MessageType: "yoyo", Data: struct {
				Text string "json:\"text\""
			}{Text: "hello how is it going"}})
			continue
		case "chatMessage":
			fmt.Println("Recieved chat-message")
			var chatMess chatMessage
			err = json.Unmarshal(rawMess, &chatMess)
			if err != nil {
				fmt.Println("Error Unmarshiling Error: ", err)
				continue
			}

			println("recieved chat Message from ", string(chatMess.Data.Message.User))
			//Handle new chatMessage here

			wsjson.Write(context, conn, testMessage{MessageType: "yoyo", Data: struct {
				Text string "json:\"text\""
			}{Text: "I got your chat Message"}})
			continue
		default:
			fmt.Println("Message type not an option")
			continue
		}
	}

}

func removeFromSlice(clients []*websocket.Conn, conn *websocket.Conn) []*websocket.Conn {
	for i, con := range clients {
		if con == conn {
			return append(clients[:i], clients[i+1:]...)
		}
	}
	return clients
}
