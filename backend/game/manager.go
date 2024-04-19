package game

import (
	"strings"
	"time"
)

type player struct {
	Username          string
	IsDead            bool
	CurrentPercentage float64
}

const (
	Green = iota
	Yellow
	Red
	Off
)

type gameState struct {
	Players          *[]player
	Round            int
	CurrentLight     int
	CurrentLightEnds time.Time
	TargetMessage    string
}

type gameUpdate struct {
	Players       *[]player `json:"players"`
	CurrentLight  int       `json:"currentLight"`
	TargetMessage string    `json:"targetMessage"`
	TargetLength  int
}

var GameState *gameState

func incomingMessage(mess message, username string) gameUpdate {
	completed := 0.0
	if strings.HasPrefix(GameState.TargetMessage, mess.Typed) {
		completed = float64(len(mess.Typed)) / float64(len(GameState.TargetMessage))
	}

	for i := 0; i < len(*GameState.Players); i++ {
		if (*GameState.Players)[i].Username == username {
			if (*GameState.Players)[i].CurrentPercentage < completed {
				(*GameState.Players)[i].CurrentPercentage = completed
			}
		}
	}
	return gameUpdate{}
}
