import { GameState } from "../interfaces/game"
import GameView from "./GameView"
import LobbyView from "./lobbyView"
import StandingsView from "./standingView"
import WinnerView from "./WinnerView"

interface GameProps {
    gameState: GameState
    setGameState: React.Dispatch<React.SetStateAction<GameState>>
    username: string
}



const Game: React.FC<GameProps> = ({gameState, setGameState, username}) =>{

    if (gameState.currentState === 'lobby'){
        return(
            <div className="flex justify-center items-center">
                <LobbyView gameState={gameState} setGameState={setGameState} username={username}/>
            </div>
        )
    }

    if (gameState.currentState === 'game'){
        return(
            <GameView gameState={gameState} setGameState={setGameState} username={username}/>
        )
    }

    if (gameState.currentState === 'betweenRound'){
        return(
            <div className="flex justify-center items-center">
                <StandingsView gameState={gameState} setGameState={setGameState} username={username}/>
            </div>
        )
    }

    if (gameState.currentState === 'winner'){
        return(
            <div className="flex justify-center items-center">
                <WinnerView gameState={gameState} setGameState={setGameState} username={username}/>
            </div>
        )
    }
}

export default Game