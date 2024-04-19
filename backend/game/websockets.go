package game

import (
	"fmt"
	"sluggers/controller"

	"github.com/gin-gonic/gin"
	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

var Clients = make([]*websocket.Conn, 0)

type message struct {
	MessageType string `json:"messageType"`
	Typed       string `json:"typed"`
}

func Route(router *gin.Engine) {
	game := router.Group("/ws")
	{
		game.GET("/", websocketHandler)
	}
}

func websocketHandler(c *gin.Context) {
	context := c.Request.Context()
	isLoggedIn, user := controller.Auth(c)
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
		var mess message
		err := wsjson.Read(context, conn, &mess)
		if err != nil {
			break
		}
		fmt.Println(mess.MessageType, mess.Typed)
		update := incomingMessage(mess, user)
		wsjson.Write(context, conn, update)
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
