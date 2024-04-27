import { useState, useRef, useEffect, useMemo } from "react"
import goSound from '../assets/goSound.mp3'
import Fireworks from './FireWork'
import deadSkull from '../assets/deadSkull.png'
import { GameState } from "../interfaces/game"
import { useFormAction } from "react-router-dom"
import { SendMessage } from "react-use-websocket"
import { ReadyWSMessage } from "../interfaces/websockets"

interface LobbyViewProps {
    gameState: GameState
    setGameState: React.Dispatch<React.SetStateAction<GameState>>
    username: string
    sendMessage: SendMessage
}


const LobbyView: React.FC<LobbyViewProps> = ({gameState, setGameState, username, sendMessage}) => {
    
    const [ready, setReady] = useState(false)
    const [numReady, setNumReady]= useState(0)
    const baseUrl: string = import.meta.env.VITE_Backend_URL

    const sendReadyUp = (isReady: boolean) => {
        const readyMess: ReadyWSMessage = {
            messageType: "readyMessage",
            data : {
                isReady: isReady
            }
        }
        sendMessage(JSON.stringify(readyMess));
    }

    const handleReadyClick = () => {
        setReady((prevState) => {

            sendReadyUp(!prevState);
            return !prevState;
        });
    }

    const countNumReady = () =>{
        let count = 0;
        gameState.Players.forEach(player => {
            if(player.IsReady){
               count += 1;
            }
        })
        setNumReady(count)
    }
    useEffect(() => {
        countNumReady();
    }, [gameState])


    return(
        <div className="card bg-base-100 w-fit min-h-72">
            <div className="flex justify-center mt-4">   
                <div className="badge badge-ghost bold-text font-bold text-3xl italic">Game Starting in: <span className="mx-2 text-4xl not-italic text-success">
                    <span className="countdown font-mono">
                        <span style={{"--value":gameState.countDown}}></span>
                    </span>
                </span>
                </div>
            </div>
            <div className="grid grid-cols-6 gap-4 max-h-[40rem] overflow-auto">
                {gameState.Players.map(Player =>
                    <div className="flex justify-center items-center p-4 flex-col">
                    <span className={Player.Username == username ? "text-bold italic text-xl text-secondary": "text-bold text-lg"}>{Player.Username}</span>
                    <div className="avatar flex flex-col h-32 w-32">
                        <div className={Player.IsReady ? "rounded-full ring ring-success": "rounded-full ring ring-error"}>
                            <img src={`${baseUrl}/public/images/${Player.Username}.png`} alt="no profile" />
                        </div>
                    </div>
                    <span className={Player.IsReady ? "text-bold text-success": "text-bold text-error"}>{Player.IsReady ? "Ready": "Not Ready"}</span>
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