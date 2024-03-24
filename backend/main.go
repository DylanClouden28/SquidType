package main

import (
	//"net/http"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"sluggers/controller"
	"time"
)

func main() {
	r := gin.Default()
	controller.Route(r)
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://localhost"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		AllowOriginFunc: func(origin string) bool {
			return origin == "https://github.com"
		},
		MaxAge: 12 * time.Hour,
	}))
	r.Run(":8000")
}
