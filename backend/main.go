package main

import (
	//"net/http"
	"github.com/gin-gonic/gin"
	"sluggers/controller"
)

func main() {
	r := gin.Default()

	/*r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "Hello, Christopher Potts")
	})*/

	controller.Route(r)
	r.Run(":8000")
}
