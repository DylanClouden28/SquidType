package game

import (
	"encoding/json"
	"fmt"
	"sluggers/controller"
	//"sluggers/database"
	"sluggers/models"

	"context"
	"sluggers/messages"

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

type reactionMessage struct {
	MessageType string `json:"messageType"`
	Data        struct {
		Reaction models.Reaction `json:"reaction"`
	} `json:"data"`
}

type readyMessage struct {
	MessageType string `json:"messageType"`
	Data        struct {
		IsReady bool `json:"isReady"`
	}
}

type gameMessage struct {
	MessageType string `json:"messageType"`
	Data        struct {
		Typed string `json:"typed"`
	}
}

func Route(router *gin.Engine) {
	game := router.Group("/api/ws")
	{
		game.GET("/", websocketHandler)
	}
}

func websocketHandler(c *gin.Context) {
	context := c.Request.Context()
	host := c.Request.Header.Get("Host")
	c.Request.Header.Set("Origin", host)

	fmt.Println("Trying to connect to websocket")
	fmt.Println("\n\n", "Recieved request: ", c.Request, "\n\n")
	isLoggedIn, username := controller.Auth(c)
	if !isLoggedIn {
		c.JSON(400, "user not logged in")
		fmt.Println("User tryed to connect to websocket was not logged in")
		return
	}

	conn, err := websocket.Accept(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(500, "error starting websocket")
		fmt.Println("error with accept handshake Error: ", err)
		return
	}
	Clients = append(Clients, conn)
	defer func() {
		Clients = removeFromSlice(Clients, conn)
		conn.Close(websocket.StatusNormalClosure, "bye bye")
		for i := 0; i < len(*GameState.Players); i++ {
			if (*GameState.Players)[i].Username == username {
				(*GameState.Players)[i].IsDead = true
			}
		}
	}()
	newPlayer := player{Username: username}
	*GameState.Players = append(*GameState.Players, newPlayer)
	sendCurrentState()

	for {
		var rawMess json.RawMessage
		err := wsjson.Read(context, conn, &rawMess)
		if err != nil {
			fmt.Println(err)
			break
		}

		var baseMess baseMessage
		err = json.Unmarshal(rawMess, &baseMess)
		if err != nil {
			fmt.Println("Error did not find messageType in rawMessage: ", string(rawMess))
			continue
		}
		fmt.Println("Recieved baseMess | type: ", baseMess.MessageType, " | rawJson: ", rawMess)

		// TODO when user connects to websocket, send out current game state
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
			if len(chatMess.Data.Message.Content) > 100 {
				continue
			}
			newMessage := messages.SendMessage(username, chatMess.Data.Message.Content)
			chatMess.Data.Message.ID = newMessage.ID
			chatMess.Data.Message.Date = newMessage.Date
			chatMess.Data.Message.Reaction = newMessage.Reaction
			chatMess.Data.Message.User = newMessage.User
			chatMess.MessageType = "chatMessage"
			js, err := json.Marshal(chatMess)
			if err != nil {
				fmt.Println(err)
				continue
			}
			SendAll(js, context)
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
			emoji.MessageType = "reactionMessage"
			js, err := json.Marshal(emoji)
			if err != nil {
				fmt.Println(err)
			}
			SendAll(js, context)
			continue
		case "readyMessage":
			var ready readyMessage
			err = json.Unmarshal(rawMess, &ready)
			if err != nil {
				fmt.Println(err)
				continue
			}
			fmt.Println(len(*GameState.Players))
			for i := 0; i < len(*GameState.Players); i++ {
				if (*GameState.Players)[i].Username == username {
					(*GameState.Players)[i].IsReady = ready.Data.IsReady
				}
			}
			IsGameReady()
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

func SendAll(json []byte, context context.Context) {
	for i := 0; i < len(Clients); i++ {
		err := Clients[i].Write(context, websocket.MessageText, json)
		if err != nil {
			fmt.Println(err)
		}
	}
}
