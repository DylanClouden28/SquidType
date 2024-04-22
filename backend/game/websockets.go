package game

import (
	"encoding/json"
	"fmt"
	"sluggers/controller"
	"sluggers/models"

	"context"
	"github.com/gin-gonic/gin"
	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
	"sluggers/messages"
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

type reactionMessage struct {
	MessageType string `json:"messageType"`
	Data        struct {
		Reaction models.Reaction `json:"reaction"`
	} `json:"data"`
}

func Route(router *gin.Engine) {
	game := router.Group("/api/ws")
	{
		game.GET("/", websocketHandler)
	}
}

func websocketHandler(c *gin.Context) {
	context := c.Request.Context()
	isLoggedIn, username := controller.Auth(c)
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
			var chatMess chatMessage
			err = json.Unmarshal(rawMess, &chatMess)
			if err != nil {
				fmt.Println("Error Unmarshiling Error: ", err)
				continue
			}
			newMessage := messages.SendMessage(username, chatMess.Data.Message.Content)
			js, err := json.Marshal(newMessage)
			if err != nil {
				fmt.Println(err)
				continue
			}
			sendAll(string(js), context)
			continue
		case "reactionMessage":
			var emoji reactionMessage
			err = json.Unmarshal(rawMess, &emoji)
			if err != nil {
				fmt.Println(err)
				continue
			}
			emoji.Data.Reaction.Username = username
			messages.SendEmoji(emoji.Data.Reaction)
			js, err := json.Marshal(emoji.Data)
			if err != nil {
				fmt.Println(err)
			}
			sendAll(string(js), context)
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

func sendAll(json string, context context.Context) {
	for i := 0; i < len(Clients); i++ {
		err := wsjson.Write(context, Clients[i], json)
		if err != nil {
			fmt.Println(err)
		}
	}
}
