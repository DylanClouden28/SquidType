import { useState, useRef } from "react"
import goSound from '../assets/goSound.mp3'
import Fireworks from './FireWork'
import deadSkull from '../assets/deadSkull.png'
import { GameState } from "../interfaces/game"

interface gameViewProps {
    gameState: GameState
    setGameState: React.Dispatch<React.SetStateAction<GameState>>
}


const GameView: React.FC<gameViewProps> = ({gameState, setGameState}) => {
    
    const mockUsers = ['User1', "Dylan", "Chris", "Steve", "Steve", "Steve", "Steve"]

    const typeBox = useRef(null);

    const [counter, setCounter]= useState(-1);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGameState(prevState => ({
            ...prevState,
            currentParagraph: e.target.value
        }))
    }

    const sortedPlayers = gameState.Players.sort((a, b) => {
        return Number(b.CurrentPercentage) - Number(a.CurrentPercentage)
    })


 
    const comparisonText = () =>{
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


            if (gameState.currentParagraph.length > i){
                acutalChar = gameState.currentParagraph[i];
            }

            if (acutalChar === undefined){
                // console.log("Undefined")
                text.push(<span className={drawLeadUser ? "text-base-content underline underline-offset-8": "text-base-content"} key={i}>{truthChar}</span>);
            }
            else if(truthChar !== acutalChar){
                // console.log("Error")
                if (truthChar === " "){
                    text.push(<span className={drawLeadUser ? "text-error underline underline-offset-8": "text-error"}key={i}>_</span>);
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

    const startCountDown = () => {
        setCounter(3);
        document.getElementById("gostart").play();
    
        const id = setInterval(() => {
            setCounter((prevCount) => {
                if (prevCount === -1){
                    clearInterval(id)
                }
                if (prevCount === 0){
                    typeBox.current.focus();
                }
                return prevCount - 1;
            })
        }, 1000) 
    }
    let playersleft = 0;
    const playersLeftCounter = sortedPlayers.forEach((player) => {
        if (!player.IsDead){
            playersleft += 1;
        }
    })

    return(
        <div>
        <div className="flex justify-center items-center mb-4">
            <CurrentLights/>
        </div>
        <div>
            <h1 className="text font-mono text-2xl text-center">Players Left <span className="countdown font-mono text-success text-xl">
            <span style={{"--value":playersleft}}></span>
            </span></h1>
        </div>
        <div className="flex flex-col w-full justify-center items-center gap-y-6 h-96 overflow-y-auto pt-64">
            {sortedPlayers.map(Player => 
                <div id={`progess_${Player.Username}`} className="flex flex-row bg-base-100 p-2 card w-5/6">
                    <div className="avatar flex flex-col h-16 w-16">
                        <div className="rounded-full">
                        <img src={`http://localhost:8000/public/images/${Player.Username}.png`} alt="no profile" />
                        </div>
                    </div>
                    <div className="flex flex-col text-xl justify-center items-center mx-2 w-full">
                        {Player.IsDead ? "💀 " + Player.Username : Player.Username}
                        <progress 
                        className={Player.IsDead ? "progress progress-error w-full h-5 transition-all duration-150 ease-in-out": 
                        "progress progress-success w-full h-5 transition-all duration-150 ease-in-out"} 
                        value={Player.CurrentPercentage} max="100">     
                        </progress>
                    </div>
                </div>

            )}
        </div>

        <div id="typing" className="card bg-base-100 p-4 mt-4 mx-10 h-48">
            <div className="p-4">
                <p>
                {comparisonText()}
                </p>
            </div>
            <input ref={typeBox} value={gameState.currentParagraph} onPaste={(e) => {e.preventDefault();}} onChange={handleInputChange} placeholder="Start typing here" className="input input-md input-bordered"></input>
        </div> 
        
        <button className="btn btn-primary" onClick={startCountDown}>Start CountDown</button>
        <audio id="gostart"><source src={goSound}></source></audio>
        {counter > -1 &&
        
            <div className="inset-0 z-10 fixed flex items-center justify-center p-4">
                <p className="text-9xl font-bold bg-base-300"></p>
                <span className="countdown">
                <span className="text-9xl" style={{"--value":counter}}></span>
                </span>
            </div>
        
        }
        <div className="z-0">
            {/* <Fireworks /> */}
        </div>
        </div>

    )
}

export default GameView