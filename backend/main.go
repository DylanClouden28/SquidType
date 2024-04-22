package main

import (
	//"net/http"
	"fmt"
	"sluggers/controller"
	"sluggers/game"
	"sluggers/messages"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func NoSniff() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("X-Content-Type-Options", "nosniff")
		c.Next()
	}

}

func main() {
	r := gin.Default()
	r.Use(NoSniff())
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8080", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		AllowOriginFunc: func(origin string) bool {
			fmt.Println(origin)
			return origin == "http://localhost:8080" || origin == "http://localhost:5173"
		},
		MaxAge: 12 * time.Hour,
	}))
	controller.Route(r)
	messages.Route(r)
	game.Route(r)
	r.Static("/api/public/images", "./public/images")
	r.Run(":8000")
}
