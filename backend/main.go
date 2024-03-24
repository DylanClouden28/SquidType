package main

import (
	//"net/http"
	"fmt"
	"sluggers/controller"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	controller.Route(r)
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://localhost:8080"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		AllowOriginFunc: func(origin string) bool {
			fmt.Println(origin)
			return origin == "http://localhost:8080"
		},
		MaxAge: 12 * time.Hour,
	}))
	r.Run(":8000")
}
