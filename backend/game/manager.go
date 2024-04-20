package game

import (
	"math/rand"
	"strings"
	"sync"
	"time"
)

type player struct {
	Username          string
	IsDead            bool
	CurrentPercentage float64
	IsReady           bool
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
	Lock             sync.Mutex
	Cond             *sync.Cond
}

type gameUpdate struct {
	Players      *[]player `json:"players"`
	CurrentLight int       `json:"currentLight"`
	MessageType  string    `json:"MessageType"`
	GameOver     bool
}

type roundStart struct {
	MessageType   string `json:"MessageType"`
	TargetMessage string `json:"targetMessage"`
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
				GameState.Lock.Lock()
				defer GameState.Lock.Unlock()
				(*GameState.Players)[i].CurrentPercentage = completed
			}
		}
	}
	return gameUpdate{}
}

func GameLoop() {
	// primary game loop
	// will always be running
	GameState.Cond = sync.NewCond(&GameState.Lock)
	for {
		// locks mutex and waits for players to be in lobby
		// waiting unlocks mutexx
		// TODO replace with ready up
		GameState.Lock.Lock()
		for len(*GameState.Players) == 0 {
			GameState.Cond.Wait()
		}
		for i := 0; i < len(*GameState.Players); i++ {
			(*GameState.Players)[i].IsDead = false
			(*GameState.Players)[i].CurrentPercentage = 0.0
		}
		GameState.TargetMessage = "Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit enim labore culpa sint ad nisi Lorem pariatur mollit ex esse exercitation amet. Nisi anim cupidatat excepteur officia. Reprehenderit nostrud nostrud ipsum Lorem est aliquip amet voluptate voluptate dolor minim nulla est proident. Nostrud officia pariatur ut officia. Sit irure elit esse ea nulla sunt ex occaecat reprehenderit commodo officia dolor Lorem duis laboris cupidatat officia voluptate. Culpa proident adipisicing id nulla nisi laboris ex in Lorem sunt duis officia eiusmod. Aliqua reprehenderit commodo ex non excepteur duis sunt velit enim. Voluptate laboris sint cupidatat ullamco ut ea consectetur et est culpa et culpa duis."
		start := roundStart{MessageType: "roundStart", TargetMessage: GameState.TargetMessage}

		GameState.Lock.Unlock()
	}

}
