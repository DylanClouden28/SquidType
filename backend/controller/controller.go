package controller

import (
	"sluggers/models"

	"github.com/gin-gonic/gin"
)

func Route(router *gin.Engine) {
	auth := router.Group("/auth")
	{
		auth.POST("/login", login)
		auth.POST("/register", register)
	}
}

func login(c *gin.Context) {

}

func register(c *gin.Context) {
	var newUser models.User
	userCollection := 

	err := c.BindJSON(&newUser)
	if err != nil {
		c.JSON(400, "Bad JSON")
	}

}
