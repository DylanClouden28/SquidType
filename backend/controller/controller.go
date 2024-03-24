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
		auth.POST("/get-user", getUser)
	}
}

func getUser(c *gin.Context) {
	logged_in, usr := Auth(c)
	if !logged_in {
		c.JSON(400, "user not logged in")
		return
	}
	c.JSON(200, usr)
}

func Auth(c *gin.Context) (bool, string) {
	users := database.Collection("users")
	auth, err := c.Cookie("auth")
	if err != nil {
		fmt.Println(err)
		return false, ""
	}
	filter := bson.D{{"token", auth}}
	var user models.User
	user_err := users.FindOne(context.TODO(), filter).Decode(&user)
	if user_err != nil {
		fmt.Println(user_err, auth)
		return false, ""
	}
	return true, user.Username
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
		fmt.Println(user_err, loginAs.Username)
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
	update := bson.D{{"$set", bson.D{{"token", hashString}}}}
	_, update_err := userCollection.UpdateOne(context.TODO(), filter, update)
	if update_err != nil {
		fmt.Println(update_err)
		c.JSON(500, "error updating token")
		return
	}
	c.SetCookie("auth", hashString, 2100000000, "", "", false, true)
	c.JSON(200, "success")
}

func register(c *gin.Context) {
	var newUser models.User
	userCollection := database.Collection("users")

	var jsonData map[string]interface{}
	err := c.BindJSON(&jsonData)
	if err != nil {
		c.JSON(400, "Bad JSON")
		return
	}
	value, exists := jsonData["username"]
	if !exists {
		c.JSON(400, "username error")
		return
	}
	if jsonData["password1"] != jsonData["password2"] {
		c.JSON(400, "Passwords do not match")
		return
	}
	newUser.Username = value.(string)
	filter := bson.D{{"username", newUser.Username}}
	var existing_user models.User
	exist := userCollection.FindOne(context.TODO(), filter).Decode(&existing_user)
	count, _ := userCollection.CountDocuments(context.TODO(), bson.D{})
	if exist == nil && count != 0 {
		c.JSON(400, "User already exists")
		return
	}
	hash, hash_err := bcrypt.GenerateFromPassword([]byte(jsonData["password1"].(string)), bcrypt.DefaultCost)
	if hash_err != nil {
		c.JSON(400, "Error hashing password(?)")
		return
	}

	newUser.Password = string(hash)

	_, ins_err := userCollection.InsertOne(context.TODO(), newUser)
	if ins_err != nil {
		c.JSON(400, "Error creating user")
		return
	}
	c.JSON(200, "success")
}
