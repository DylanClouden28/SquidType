package game

import (
	"context"
	"encoding/json"
	"fmt"
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

const (
	Lobby = iota
	Game
	Winner
	BetweenRound
)

type gameState struct {
	Players          *[]player
	Round            int
	CurrentLight     int
	CurrentLightEnds time.Time
	PreviousLightEnd time.Time
	TargetMessage    string
	currentState     int
	Lock             sync.Mutex
	Cond             *sync.Cond
}

type gameUpdate struct {
	Players      *[]player `json:"players"`
	CurrentLight string    `json:"currentLight"`
	MessageType  string    `json:"MessageType"`
}

type stateUpdate struct {
	CurrentState  string    `json:"currentState"`
	Players       *[]player `json:"players"`
	MessageType   string    `json:"MessageTyep"`
	TargetMessage string    `json:"targetMessage"`
}

var GameState *gameState

func incomingMessage(mess gameMessage, username string) {
	if GameState.CurrentLight == Red && !GameState.PreviousLightEnd.Before(time.Now().Add(time.Millisecond*100)) {
		for i := 0; i < len(*GameState.Players); i++ {
			if (*GameState.Players)[i].Username == username {
				(*GameState.Players)[i].IsDead = true
				roundOverCheck()
				return
			}
		}
	}
	completed := 0.0
	if strings.HasPrefix(GameState.TargetMessage, mess.Data.Typed) {
		completed = float64(len(mess.Data.Typed)) / float64(len(GameState.TargetMessage))
	}

	for i := 0; i < len(*GameState.Players); i++ {
		if (*GameState.Players)[i].Username == username {
			if (*GameState.Players)[i].CurrentPercentage < completed {
				//GameState.Lock.Lock()
				//defer GameState.Lock.Unlock()
				(*GameState.Players)[i].CurrentPercentage = completed
			}
		}
	}
	return
}

var playersReady chan bool
var backgroundContext context.Context
var isRoundOver *bool

func IsGameReady() {
	c := 0
	totalPlayers := len(*GameState.Players)
	for i := 0; i < totalPlayers; i++ {
		if (*GameState.Players)[i].IsReady {
			c += 1
		}
	}
	if totalPlayers <= c*2 {
		playersReady <- true
	}
}

func sendCurrentState() {
	state := ""
	stateUpdateMessage := stateUpdate{Players: GameState.Players, MessageType: "stateUpdate"}
	switch GameState.currentState {
	case Lobby:
		state = "lobby"
	case Game:
		state = "game"
		stateUpdateMessage.TargetMessage = GameState.TargetMessage
	case Winner:
		state = "winner"
	case BetweenRound:
		state = "betweenRound"
	}
	stateUpdateMessage.CurrentState = state
	js, err := json.Marshal(stateUpdateMessage)
	if err != nil {
		fmt.Println(err)
		return
	}
	SendAll(js, backgroundContext)
}

func gameUpdateSender() {
	for !(*isRoundOver) {
		light := ""
		switch GameState.CurrentLight {
		case Off:
			light = "off"
		case Red:
			light = "red"
		case Green:
			light = "green"
		case Yellow:
			light = "yellow"
		}
		update := gameUpdate{MessageType: "gameUpdate", Players: GameState.Players, CurrentLight: light}
		js, err := json.Marshal(update)
		if err != nil {
			fmt.Println(err)
		} else {
			SendAll(js, backgroundContext)
		}
		time.Sleep(500 * time.Millisecond)
	}
}

func roundOverCheck() {
	// Checks if the round is over
	// call every time player dies
	// set isRoundOver to true if round should end
	// TODO implement func
}

func isGameOver() bool {
	// returns true if there is 1 player alive
	// otherwise false
	for i := 0; i < len(*GameState.Players); i++ {
		if !(*GameState.Players)[i].IsDead {
			return false
		}
	}
	return true
}

func GameLoop() {
	// primary game loop
	// will always be running
	GameState.Cond = sync.NewCond(&GameState.Lock)
	playersReady = make(chan bool)
	isRoundOver = new(bool)
	backgroundContext = context.Background()
	for {
		<-playersReady
		// waits for enough players to be readied up
		GameState.TargetMessage = "Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit enim labore culpa sint ad nisi Lorem pariatur mollit ex esse exercitation amet. Nisi anim cupidatat excepteur officia. Reprehenderit nostrud nostrud ipsum Lorem est aliquip amet voluptate voluptate dolor minim nulla est proident. Nostrud officia pariatur ut officia. Sit irure elit esse ea nulla sunt ex occaecat reprehenderit commodo officia dolor Lorem duis laboris cupidatat officia voluptate. Culpa proident adipisicing id nulla nisi laboris ex in Lorem sunt duis officia eiusmod. Aliqua reprehenderit commodo ex non excepteur duis sunt velit enim. Voluptate laboris sint cupidatat ullamco ut ea consectetur et est culpa et culpa duis."
		GameState.currentState = Game
		sendCurrentState()
		// sets current state to game and sends that updated state to users
		go gameUpdateSender()
		// starts sending out updates of the game state
		// TODO for loop for as long as game is going on ie more than 1 player alive
		// that for loop needs for loop handling individual rounds
		// and the progression will be green light > yellow > red, with each having
		// a random duration. Each time a player dies a check is made if the round should
		// end, so the isRoundOver is handled outside this function
		// the round ends is isRoundOver is true and the light is red
		// TODO logic for the game ending, resetting values and ending for loop
		// for a new game to start
		// set all players to alive and percentage to 0
		//for i := 0; i < len(*GameState.Players); i++ {
		//	(*GameState.Players)[i].IsDead = false
		//	(*GameState.Players)[i].CurrentPercentage = 0.0
		//}
		// set new target message
		// TODO generate target message in some way
		// start := roundStart{MessageType: "roundStart", TargetMessage: GameState.TargetMessage}
		//
		for isGameOver() {
			// runs as long as game is not over
			for !*isRoundOver {
				GameState.CurrentLight = Green
				duration := time.Duration(rand.Intn(5)+5) * time.Second
				GameState.CurrentLightEnds = time.Now().Add(time.Second * duration)
				time.Sleep(duration)
				GameState.CurrentLight = Yellow
				duration = time.Duration(rand.Intn(4)+1) * time.Second
				GameState.PreviousLightEnd = time.Now().Add(duration)
				time.Sleep(duration)
				GameState.CurrentLight = Red
				duration = time.Duration(rand.Intn(4) + 1)
			}
			GameState.currentState = BetweenRound
			sendCurrentState()
			for i := 0; i < len(*GameState.Players); i++ {
				(*GameState.Players)[i].CurrentPercentage = 0.0
			}
			time.Sleep(time.Second * 30)
			GameState.currentState = Game
			GameState.TargetMessage = "New Message Here"
			sendCurrentState()
			time.Sleep(time.Second * 3)
			*isRoundOver = false
		}
		GameState.currentState = Winner
		sendCurrentState()
		// TODO send the ranking for the winner page
		// TODO keep track of when players die for rankings

	}

}
