package controller

import (
	"context"
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"sluggers/database"
	"sluggers/models"

	"crypto/sha256"
	"math/rand"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"
)

func Route(router *gin.Engine) {
	auth := router.Group("/auth")
	{
		auth.POST("/login", login)
		auth.POST("/register", register)
	}
}

func login(c *gin.Context) {
	var userLogin models.User
	userCollection := database.Collection("users")

	err := c.BindJSON(&userLogin)
	if err != nil {
		c.JSON(400, "Bad JSON")
		return
	}
	filter := bson.D{{"username", userLogin.Username}}
	var loginAs models.User
	user_err := userCollection.FindOne(context.TODO(), filter).Decode(&loginAs)
	if user_err != nil {
		c.JSON(400, "No such user")
		return
	}
	success := bcrypt.CompareHashAndPassword([]byte(loginAs.Password), []byte(userLogin.Password))
	if success != nil {
		c.JSON(400, "Incorrect passowrd")
		return
	}
	// get hash object
	hash := sha256.New()
	// get random int
	unhashed := rand.Int()
	// make 8 byte slice and put the int into it
	bytes := make([]byte, 8)
	binary.LittleEndian.PutUint64(bytes, uint64(unhashed))
	// write those bytes to the hash and output it
	hash.Write(bytes)
	hashBytes := hash.Sum(nil)
	// turn the hash into hex
	hashString := hex.EncodeToString(hashBytes)
	loginAs.Token = hashString
	c.SetCookie("auth", hashString, 2100000000, "", "", true, true)

}

func register(c *gin.Context) {
	var newUser models.User
	userCollection := database.Collection("users")

	err := c.BindJSON(&newUser)
	if err != nil {
		c.JSON(400, "Bad JSON")
		fmt.Println(err)
		return
	}

	hash, hash_err := bcrypt.GenerateFromPassword([]byte(newUser.Password), bcrypt.DefaultCost)
	if hash_err != nil {
		c.JSON(400, "Error hashing password(?)")
		return
	}

	newUser.Password = string(hash)

	_, ins_err := userCollection.InsertOne(context.TODO(), newUser)
	if ins_err != nil {
		c.JSON(400, "Error creating user, try a different username")
		fmt.Println(ins_err)
		return
	}
}
