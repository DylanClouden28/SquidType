package main

import (
	//"net/http"
	"sluggers/controller"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	controller.Route(r)
	r.Run(":8000")
}
