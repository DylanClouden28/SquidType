package controller

import (
	"context"
	"encoding/binary"
	"encoding/hex"
	"encoding/json"
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
	c.SetCookie("auth", hashString, 2100000000, "", "", true, true)

}

type passwords struct {
	Password1 string `json:"password1"`
	Password2 string `json:"password2"`
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
	// fmt.Println("usr", newUser, newUser.Username, "name")
	filter := bson.D{{"username", newUser.Username}}
	exists := userCollection.FindOne(context.TODO(), filter).Decode(nil)
	if exists != nil {
		c.JSON(400, "User already exists")
		return
	}
	hash, hash_err := bcrypt.GenerateFromPassword([]byte(newUser.Password), bcrypt.DefaultCost)
	if hash_err != nil {
		c.JSON(400, "Error hashing password(?)")
		return
	}

	newUser.Password = string(hash)
	var password passwords
	p_err := c.BindJSON(&password)
	if p_err != nil {
		c.JSON(400, "Error getting passwords")
		return
	}
	if password.Password1 != password.Password2 {
		c.JSON(400, "Passwords do not match")
		return
	}

	_, ins_err := userCollection.InsertOne(context.TODO(), newUser)
	if ins_err != nil {
		c.JSON(400, "Error creating user")
		fmt.Println(ins_err)
		return
	}
	// c.JSON(200, "success")
}
