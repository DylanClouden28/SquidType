import { useState, useRef, useEffect } from "react"
import goSound from '../assets/goSound.mp3'
import Fireworks from './FireWork'
import deadSkull from '../assets/deadSkull.png'
import { SendMessage } from "react-use-websocket"
import { GameState, Player } from "../interfaces/game"

interface gameViewProps {
    gameState: GameState
    setGameState: React.Dispatch<React.SetStateAction<GameState>>
    username: string
    sendMessage: SendMessage
}


const GameView: React.FC<gameViewProps> = ({gameState, setGameState, username, sendMessage}) => {
    const baseUrl: string = import.meta.env.VITE_Backend_URL
    
    const typeBox = useRef(null);

    const [counter, setCounter]= useState(-1);

    const [myWPM, setMyWPM] = useState(0);

    const [isComplete, setComplete] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {


        setGameState(prevState => ({
            ...prevState,
            currentParagraph: e.target.value
        }))

        if (e.target.value === gameState.TargetParagraph){
            setComplete(true);
        }

        handleTypingMessage(e.target.value)
    }

    const handleTypingMessage = (text: string) => {

        const currentText = text;
        if (currentText === undefined) {
            return
        }

        if (currentText.length > 1000){
            return
        }

        const message = JSON.stringify({
            messageType: 'gameMessage',
            typed: text
        })
        sendMessage(message);
    }

    const sortedPlayers = gameState.Players.sort((a, b) => {
        return Number(b.CurrentPercentage) - Number(a.CurrentPercentage)
    })

    const isCurrentPlayer = (player: Player) => {
        return player.Username === username;
    }

    useEffect(() => {
        const myPlayer = gameState.Players.find(isCurrentPlayer)
        if (myPlayer === undefined){
            return
        }

        setMyWPM(myPlayer.WPM);
    }, [gameState.Players])

 
    const comparisonText = (paragraph: string) =>{
        console.log(paragraph)
        let text = [];
        let error = false;
        let leadUser = undefined
        let leadUserTextLength = undefined
        if (sortedPlayers.length > 0){
            leadUser = sortedPlayers[0];
            leadUserTextLength = gameState.TargetParagraph.length * Number(leadUser.CurrentPercentage) / 100;
        }
        // console.log("Lead user lenth", leadUserTextLength)
        for (let i =0; i < gameState.TargetParagraph.length; i++){
            const truthChar = gameState.TargetParagraph[i];
            let acutalChar = undefined;
            let drawLeadUser = leadUserTextLength ? (leadUserTextLength > i ? true : false) : false


            if (paragraph.length > i){
                acutalChar = paragraph[i];
            }

            if (acutalChar === undefined){
                // console.log("Undefined")
                text.push(<span className={drawLeadUser ? "text-base-content underline underline-offset-8": "text-base-content"} key={i}>{truthChar}</span>);
            }
            else if(truthChar !== acutalChar){
                // console.log("Error")
                if (truthChar === " "){
                    text.push(<span className={drawLeadUser ? "text-error underline underline-offset-8": "text-error"}key={i}> </span>);
                }else{
                    text.push(<span className={drawLeadUser ? "text-error underline underline-offset-8": "text-error"} key={i}>{truthChar}</span>);
                }
                error = true
            }
            else{
                if (error === true){
                    text.push(<span className={drawLeadUser ? "text-error underline underline-offset-8": "text-error"} key={i}>{truthChar}</span>);
                    continue
                }
                text.push(<span className={drawLeadUser ? "text-success underline underline-offset-8": "text-success"}key={i}>{truthChar}</span>);
            }
        }
        // console.log(text)
        return text;
    }   

    const CurrentLights = () =>{

        return(
            <div className="card bg-base-100 h-16 rounded-full w-1/5 flex justify-center items-center flex-row gap-x-6">
                <div className={gameState.currentLight === 'green'? "w-12 h-12 bg-green-600 brightness-200 rounded-full" : "w-12 h-12 bg-green-600 rounded-full bg-opacity-20"}></div>
                <div className={gameState.currentLight === 'yellow'? "w-12 h-12 bg-yellow-600 brightness-200 rounded-full" : "w-12 h-12 bg-yellow-600 rounded-full bg-opacity-20"}></div>
                <div className={gameState.currentLight === 'red'? "w-12 h-12 bg-red-600 brightness-200 rounded-full" : "w-12 h-12 bg-red-600 rounded-full bg-opacity-20"}></div>
            </div>);
    }

    let playersleft = 0;
    const playersLeftCounter = sortedPlayers.forEach((player) => {
        if (!player.IsDead){
            playersleft += 1;
        }
    })

    const getMyPlayer = sortedPlayers.find((Player) => {
        return Player.Username == username;
    })

    return(
        <div>
        <div className="flex justify-center items-center my-4">
            <CurrentLights/>
        </div>
        <div id="typing" className="card bg-base-100 p-4 mt-4 mx-10 h-fit mb-5">
            <div className="text-center">
                <span className="text-3xl font-bold italic text-accent">WPM: <span className="not-italic text-neutral-content">{myWPM}</span></span>
            </div>
            <div className="p-1">
                <p className="select-none text-2xl font-mono">
                {comparisonText(gameState.currentParagraph)}
                </p>
            </div>
            <input id="game-input" disabled={getMyPlayer !== undefined ? Boolean(getMyPlayer?.IsDead) || isComplete: false} ref={typeBox} value={gameState.currentParagraph} onPaste={(e) => {e.preventDefault();}} onChange={handleInputChange} placeholder={getMyPlayer !== undefined ? getMyPlayer?.IsDead ? "Your dead that sucks": "Start typing here" : "Start typing here"} className="input input-lg input-bordered"></input>
        </div> 

        <div className="mb-2">
            <h1 className="text font-mono text-2xl text-center">Players Left <span className="countdown font-mono text-success text-xl">
            <span style={{"--value":playersleft}}></span>
            </span></h1>
        </div>

        <div className="grid grid-cols-3 w-full items-center gap-y-4 gap-x-4 h-96 overflow-y-scroll m-4">
            {sortedPlayers.map((Player, index) => 
                <div id={`progess_${Player.Username}`} className={index == 0 ? "flex flex-row bg-base-100 p-2 card m-0 tooltip tooltip-bottom col-span-3": "flex flex-row bg-base-100 p-2 card m-0 tooltip tooltip-bottom"} 
                data-tip={
                    gameState.TargetParagraph.slice(0, gameState.TargetParagraph.length * Number(Player.CurrentPercentage) / 100)
                    } >
                    <span>#${index}</span>
                    <div className="avatar flex flex-col h-16 w-16">
                        <div className="rounded-full">
                        <img src={`${baseUrl}/public/images/${Player.Username}.png`} alt="no profile" />
                        </div>
                    </div>
                    <div className="flex flex-col text-xl justify-center items-center mx-2 w-full">
                        <span className={Player.Username == username ? "text-bold italic text-xl text-secondary": "text-bold text-lg"}>{Player.IsDead ? "💀 " + Player.Username : Player.Username}</span>
                        <progress 
                        className={Player.IsDead ? "progress progress-error w-full h-5 transition-all duration-150 ease-in-out": 
                        "progress progress-success w-full h-5 transition-all duration-150 ease-in-out"} 
                        value={Player.CurrentPercentage} max="100">     
                        </progress>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                        <span className="font-bold">WPM</span>
                        <span className="italic">{Player.WPM}</span>
                    </div>
                </div>

            )}
        </div>

        {/* <button className="btn btn-primary" onClick={startCountDown}>Start CountDown</button> */}
        <audio id="gostart"><source src={goSound}></source></audio>
        <div className="z-0">
            {/* <Fireworks /> */}
        </div>
        </div>

    )
}

export default GameView