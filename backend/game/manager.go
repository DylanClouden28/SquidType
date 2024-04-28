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
	Rank              int
	isConn            bool
	WPM               int32
	isDone            bool
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
	Players           *[]player
	Round             int
	CurrentLight      int
	CurrentLightStart time.Time
	PreviousLightEnd  time.Time
	TargetMessage     string
	currentState      int
	DeadRound         int
	DeadTarget        int
	Rank              int
	CountDown         int
	LastRound         bool
	GameOver          bool
	TotalInRound      int
	RoundDuration     time.Duration
	Lock              sync.Mutex
	Cond              *sync.Cond
}

type gameUpdate struct {
	Players      *[]player `json:"players"`
	CurrentLight string    `json:"currentLight"`
	MessageType  string    `json:"MessageType"`
	CurrentState string    `json:"currentState"`
	CountDown    int       `json:"countDown"`
}

type stateUpdate struct {
	CurrentState  string    `json:"currentState"`
	Players       *[]player `json:"players"`
	MessageType   string    `json:"MessageType"`
	TargetMessage string    `json:"targetMessage"`
}

var GameState *gameState

func incomingMessage(mess gameMessage, username string) {
	j := 0
	for i := 0; i < len(*GameState.Players); i++ {
		if (*GameState.Players)[i].Username == username {
			j = i
		}
	}
	if (*GameState.Players)[j].IsDead == true {
		return
	}
	if GameState.CurrentLight == Red {
		fmt.Println("light is red, user typed in", GameState.PreviousLightEnd.Before(time.Now().Add(time.Millisecond*200)))
		fmt.Println(GameState.PreviousLightEnd, time.Now())
	}
	if GameState.CurrentLight == Red && GameState.PreviousLightEnd.Before(time.Now().Add(-time.Millisecond*200)) {
		(*GameState.Players)[j].IsDead = true
		(*GameState.Players)[j].Rank = GameState.Rank
		GameState.Rank += 1
		GameState.DeadRound += 1
	} else {
		completed := 0.0
		if strings.HasPrefix(GameState.TargetMessage, mess.Typed) {
			completed = float64(len(mess.Typed)) / float64(len(GameState.TargetMessage))
		}
		if (*GameState.Players)[j].CurrentPercentage < completed {
			(*GameState.Players)[j].CurrentPercentage = completed
		}
		if completed > .999999999 {
			(*GameState.Players)[j].isDone = true
		}
	}
	if isOverCheck() && !GameState.GameOver {
		// if this player finishes ends the round
		// assign ranks to all user who die,
		// and if its last round assign ordering for
		// winners
		playersToKill := GameState.DeadTarget - GameState.DeadRound
		for ; playersToKill > 0; playersToKill-- {
			lowest_complete := 1.0
			kill := -1
			for i := 0; i < len(*GameState.Players); i++ {
				if !(*GameState.Players)[i].IsDead {
					if (*GameState.Players)[i].CurrentPercentage < lowest_complete {
						kill = i
						lowest_complete = (*GameState.Players)[i].CurrentPercentage
					}
				}
				if kill != -1 {
					(*GameState.Players)[kill].IsDead = true
					(*GameState.Players)[kill].Rank = GameState.Rank
					fmt.Println("setting player %s to dead and assigning rank", (*GameState.Players)[kill].Username)
					GameState.Rank += 1
				}
			}
		}
		fmt.Println("last round: ", GameState.LastRound)
		if GameState.LastRound {
			lowest := 1.0
			lowestPlayer := -1
			for {
				for i := 0; i < len(*GameState.Players); i++ {
					fmt.Println("user: %s is %s", (*GameState.Players)[i].Username, (*GameState.Players)[i].IsDead)
					if (*GameState.Players)[i].CurrentPercentage <= lowest && !(*GameState.Players)[i].IsDead {
						lowest = (*GameState.Players)[i].CurrentPercentage
						lowestPlayer = i
					}
				}
				if lowestPlayer == -1 {
					break
				}
				(*GameState.Players)[lowestPlayer].Rank = GameState.Rank
				(*GameState.Players)[lowestPlayer].IsDead = true
				GameState.Rank++
				fmt.Println("setting player %s to dead and assigning rank", (*GameState.Players)[lowestPlayer].Username)
				lowest = 1.0
				lowestPlayer = -1
			}
		}
		GameState.GameOver = true
	}
}

var playersReady chan bool
var backgroundContext context.Context

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
	for {
		duration := GameState.RoundDuration
		if GameState.CurrentLight != Red {
			duration += time.Now().Sub(GameState.CurrentLightStart)
		}
		paragraphLen := float64(len(GameState.TargetMessage))
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
		state := ""
		switch GameState.currentState {
		case Lobby:
			state = "lobby"
		case Game:
			state = "game"
		case Winner:
			state = "winner"
		case BetweenRound:
			state = "betweenRound"
		}
		update := gameUpdate{MessageType: "gameUpdate", Players: GameState.Players, CurrentLight: light, CurrentState: state, CountDown: GameState.CountDown}
		for i := 0; i < len(*update.Players); i++ {
			//if (*update.Players)[i].CurrentPercentage > .999999999 {
			//	(*update.Players)[i].isDone = true
			if !(*update.Players)[i].IsDead && !(*update.Players)[i].isDone {
				words := (*update.Players)[i].CurrentPercentage * paragraphLen / 5.0
				wpm := words / duration.Minutes()
				(*update.Players)[i].WPM = int32(wpm)
			}
		}
		js, err := json.Marshal(update)
		if err != nil {
			fmt.Println(err)
		} else {
			SendAll(js, backgroundContext)
		}
		time.Sleep(500 * time.Millisecond)
	}
}

func isOverCheck() bool {
	// if enough players have died, return true
	// if enough players are done, return true
	// otherwise, false
	if GameState.DeadRound >= GameState.DeadTarget {
		fmt.Println("dead this round: ", GameState.DeadRound, "dead target for round: ", GameState.DeadTarget)
		fmt.Println("dead target")
		return true
	}
	c := 0
	for i := 0; i < len(*GameState.Players); i++ {
		if (*GameState.Players)[i].isDone {
			c++
		}
	}
	if c >= GameState.DeadTarget {
		// TODO kill bottom half of players
		// and assign ranks
		fmt.Println("alive target")
		return true
	}
	fmt.Println("false true")
	return false

}

func GameLoop() {
	// primary game loop
	// will always be running
	p := make([]player, 0)
	GameState = &gameState{Players: &p}
	GameState.Cond = sync.NewCond(&GameState.Lock)
	playersReady = make(chan bool)
	backgroundContext = context.Background()
	fmt.Println("starting gameplay loop, waiting for players to ready")
	GameState.currentState = Lobby
	go gameUpdateSender()
	for {
		GameState.CurrentLight = 0
		GameState.PreviousLightEnd = time.Time{}
		GameState.RoundDuration = 0
		GameState.CurrentLightStart = time.Time{}
		GameState.DeadRound = 0
		GameState.DeadTarget = 0
		GameState.Round = 0
		<-playersReady
		// TODO remove any pleyers from slice that are not connected
		fmt.Println("players ready; starting game")
		// waits for enough players to be readied up
		GameState.TargetMessage = "Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit enim labore culpa sint ad nisi Lorem pariatur mollit ex esse exercitation amet. Nisi anim cupidatat excepteur officia. Reprehenderit nostrud nostrud ipsum Lorem est aliquip amet voluptate voluptate dolor minim nulla est proident. Nostrud officia pariatur ut officia. Sit irure elit esse ea nulla sunt ex occaecat reprehenderit commodo officia dolor Lorem duis laboris cupidatat officia voluptate. Culpa proident adipisicing id nulla nisi laboris ex in Lorem sunt duis officia eiusmod. Aliqua reprehenderit commodo ex non excepteur duis sunt velit enim. Voluptate laboris sint cupidatat ullamco ut ea consectetur et est culpa et culpa duis."
		for i := 0; i < 10; i++ {
			GameState.CountDown = 9 - i
			time.Sleep(time.Second)
		}
		time.Sleep(time.Second)
		GameState.currentState = Game
		sendCurrentState()
		GameState.CountDown = 0
		// sets current state to game and sends that updated state to users
		// starts sending out updates of the game state
		// TODO for loop for as long as game is going on ie more than 1 player alive
		// with maybe something to end the game no matter what when 1 player is alive
		// TODO for loop for handling individual rounds in a game
		// and the progression will be green light > yellow > red, with each having
		// a random duration. Each time a player dies a check is made if the round should
		// end, so the isRoundOver is handled outside this function
		// the round ends is isRoundOver is true and the light is red would need to implement
		// some way of waking up if the round ends mid red light
		// TODO generate target message in some way
		// start := roundStart{MessageType: "roundStart", TargetMessage: GameState.TargetMessage}
		//
		time.Sleep(time.Second * 10)
		alive := 0
		for i := 0; i < len(*GameState.Players); i++ {
			if !(*GameState.Players)[i].IsDead {
				alive++
			}
		}
		if alive <= 3 {
			GameState.LastRound = true
		}
		for {
			GameState.RoundDuration = time.Duration(0)
			GameState.DeadRound = 0
			GameState.DeadTarget = 0
			GameState.DeadTarget = ((alive - 1) / 2) + 1
			// runs as long as round is not over
			for !isOverCheck() {
				GameState.CurrentLight = Green
				fmt.Println("light is now: ", GameState.CurrentLight)
				duration := time.Duration(rand.Intn(5)+5) * time.Second
				GameState.CurrentLightStart = time.Now()
				time.Sleep(duration)
				if isOverCheck() {
					break
				}
				GameState.RoundDuration = GameState.RoundDuration + duration
				GameState.CurrentLightStart = time.Now()
				GameState.CurrentLight = Yellow
				fmt.Println("light is now: ", GameState.CurrentLight)
				duration = time.Duration(rand.Intn(4)+1) * time.Second
				GameState.PreviousLightEnd = time.Now().Add(duration)
				time.Sleep(duration)
				if isOverCheck() {
					break
				}
				GameState.RoundDuration = GameState.RoundDuration + duration
				GameState.CurrentLightStart = time.Now()
				GameState.CurrentLight = Red
				fmt.Println("light is now: ", GameState.CurrentLight)
				duration = time.Duration(rand.Intn(4)+1) * time.Second
				time.Sleep(duration)
			}
			if GameState.LastRound {
				// if the game is over, skip between rounds
				break
			}
			// following code only runs when the round is over
			// but the game is not
			GameState.currentState = BetweenRound
			sendCurrentState()
			for i := 0; i < len(*GameState.Players); i++ {
				(*GameState.Players)[i].CurrentPercentage = 0.0
			}
			time.Sleep(time.Second * 10)
			GameState.currentState = Game
			GameState.TargetMessage = "New Message Here"
			sendCurrentState()
			for i := 0; i < 10; i++ {
				GameState.CountDown = 9 - i
				time.Sleep(time.Second)
			}
			time.Sleep(time.Second)
			alive = 0
			for i := 0; i < len(*GameState.Players); i++ {
				if !(*GameState.Players)[i].IsDead {
					alive++
				}
			}
			if alive <= 3 {
				GameState.LastRound = true
			}
		}
		GameState.currentState = Winner
		time.Sleep(time.Second * 10)
		*GameState.Players = make([]player, 0)
		// TODO set all playesr back to not ready
		// TODO send the ranking for the winner page
		// TODO keep track of when players die for rankings
		ping := "{\"MessageType\":\"pingMessage\"}"
		SendAll([]byte(ping), backgroundContext)
		GameState.currentState = Lobby
		sendCurrentState()
		for len(playersReady) > 0 {
			<-playersReady
		}
	}
}
