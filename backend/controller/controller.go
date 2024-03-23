package controller

import (
	"github.com/gin-gonic/gin"
)

func Route(router *gin.Engine) {
	auth := router.Group("/auth")
	{
		auth.GET("/", test)
	}
}

func test(c *gin.Context) {

}
