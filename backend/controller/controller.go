package controller

import (
	"github.com/gin-gonic/gin"
	"sluggers/database"
	"sluggers/models"
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
	userCollection := database.Collection("collection")

	err := c.BindJSON(&newUser)
	if err != nil {
		c.JSON(400, "Bad JSON")
	}

}
