import { useState, useRef, useEffect, useMemo } from "react"
import goSound from '../assets/goSound.mp3'
import Fireworks from './FireWork'
import deadSkull from '../assets/deadSkull.png'
import { GameState } from "../interfaces/game"
import { useFormAction } from "react-router-dom"

interface LobbyViewProps {
    gameState: GameState
    setGameState: React.Dispatch<React.SetStateAction<GameState>>
    username: string
}


const LobbyView: React.FC<LobbyViewProps> = ({gameState, setGameState, username}) => {
    
    const [ready, setReady] = useState(false)
    const [numReady, setNumReady]= useState(0)

    const handleReadyClick = () => {
        setReady(!ready);
    }

    const countNumReady = () =>{
        let count = 0;
        gameState.Players.forEach(player => {
            if(player.isReady){
               count += 1;
            }
        })
        setNumReady(count)
    }
    useEffect(() => {
        countNumReady();
    }, [gameState])


    return(
        <div className="card bg-base-100 w-fit h-fit min-h-72">
            <div className="flex justify-center mt-4">   
                <div className="badge badge-ghost bold-text font-bold text-3xl italic">Game Starting in: <span className="mx-2 text-4xl not-italic text-success">
                    <span className="countdown font-mono">
                        <span style={{"--value":gameState.countDown}}></span>
                    </span>
                </span>
                </div>
            </div>
            <div className="grid grid-cols-6 gap-4">
                {gameState.Players.map(Player =>
                    <div className="flex justify-center items-center p-4 flex-col">
                    <span className={Player.Username == username ? "text-bold text-lg": "text-bold italic text-xl text-secondary"}>{Player.Username}</span>
                    <div className="avatar flex flex-col h-32 w-32">
                        <div className={Player.isReady ? "rounded-full ring ring-success": "rounded-full ring ring-error"}>
                            <img src={`http://localhost:8000/public/images/${Player.Username}.png`} alt="no profile" />
                        </div>
                    </div>
                    <span className={Player.isReady ? "text-bold text-success": "text-bold text-error"}>{Player.isReady ? "Ready": "Not Ready"}</span>
                    </div>
                )}
                <div>

                </div>
            </div>
            <div className="flex justify-center">   
                <div className="badge badge-neutral bold-text font-bold text-xl italic p-3">Players Ready: <span className="mx-2 text-2xl not-italic text-success">{numReady}</span></div>
            </div>
            <button className={ready ? "btn btn-success m-4" : "btn btn-error m-4"} onClick={handleReadyClick}>{ready ? "Ready" : "Not Ready"}</button>
        </div>

    )
}

export default LobbyView