package main

import (
	//"net/http"
	"fmt"
	"golang.org/x/time/rate"
	"sluggers/controller"
	"sluggers/game"
	"sluggers/messages"
	"sync"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type RateLimiter struct {
	limiter      *rate.Limiter
	lastSeen     time.Time
	blockedUntil time.Time
}

var clients = make(map[string]*RateLimiter)
var mutex sync.Mutex

func rateLimiter() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.GetHeader("X-Real-IP")
		if ip == "" {
			ip = c.ClientIP()
		}
		mutex.Lock()
		limiter, exists := clients[ip]
		if !exists {
			limiter = &RateLimiter{limiter: rate.NewLimiter(rate.Every(200*time.Millisecond), 50)}
			clients[ip] = limiter
		}
		limiter.lastSeen = time.Now()
		fmt.Println(limiter.limiter.Tokens())
		if time.Now().Before(limiter.blockedUntil) {
			mutex.Unlock()
			fmt.Println("429")
			c.JSON(429, "Too Many Requests")
			return
		}
		if !limiter.limiter.Allow() {
			limiter.blockedUntil = time.Now().Add(30 * time.Second)
			mutex.Unlock()
			fmt.Println("429")
			c.JSON(429, "Too Many Requests")
			return
		}
		mutex.Unlock()
		c.Next()
	}
}

func NoSniff() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("X-Content-Type-Options", "nosniff")
		c.Next()
	}
}

func main() {
	r := gin.Default()
	r.Use(rateLimiter())
	r.Use(NoSniff())
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8080", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		AllowOriginFunc: func(origin string) bool {
			fmt.Println(origin)
			return origin == "http://localhost:8080" || origin == "http://localhost:5173"
		},
		MaxAge: 12 * time.Hour,
	}))
	controller.Route(r)
	messages.Route(r)
	game.Route(r)
	go game.GameLoop()
	r.Static("/api/public/images", "./public/images")
	r.Run(":8000")
}
