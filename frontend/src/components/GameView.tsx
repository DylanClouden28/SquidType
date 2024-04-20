import { useState } from "react"
import goSound from '../assets/goSound.mp3'
import Fireworks from './FireWork'
import { GameState } from "../interfaces/game"

interface gameViewProps {
    gameState: GameState
    setGameState: React.Dispatch<React.SetStateAction<GameState>>
}


const GameView: React.FC<gameViewProps> = ({gameState, setGameState}) => {
    
    const mockUsers = ['User1', "Dylan", "Chris", "Steve", "Steve", "Steve", "Steve"]

    const [counter, setCounter]= useState(0);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGameState(prevState => ({
            ...prevState,
            currentParagraph: e.target.value
        }))
    }


 
    const comparisonText = () =>{
        let text = [];
        let error = false;
        for (let i =0; i < gameState.TargetParagraph.length; i++){
            const truthChar = gameState.TargetParagraph[i];
            let acutalChar = undefined;


            if (gameState.currentParagraph.length > i){
                acutalChar = gameState.currentParagraph[i];
            }

            if (acutalChar === undefined){
                // console.log("Undefined")
                text.push(<span className="text-base-content" key={i}>{truthChar}</span>);
            }
            else if(truthChar !== acutalChar){
                // console.log("Error")
                if (truthChar === " "){
                    text.push(<span className="text-error" key={i}>_</span>);
                }else{
                    text.push(<span className="text-error" key={i}>{truthChar}</span>);
                }
                error = true
            }
            else{
                if (error === true){
                    text.push(<span className="text-error" key={i}>{truthChar}</span>);
                    continue
                }
                text.push(<span className="text-success" key={i}>{truthChar}</span>);
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

    const startCountDown = async () => {
        await setCounter(3);
        console.log(counter);
        const id = setInterval(() => {
            if (counter === 0){
                clearInterval(id);
            }
            setCounter(counter - 1);
        }) 
    }

    return(
        <div>
        <div className="flex justify-center items-center mb-4">
            <CurrentLights/>
        </div>
        <div className="flex flex-col w-full justify-center items-center gap-y-6 h-96 overflow-auto">
            {mockUsers.map(user => 
                <div id={`progess_${user}`} className="flex flex-row bg-base-100 p-2 card w-5/6">
                    <div className="avatar flex flex-col h-16 w-16">
                        <div className="rounded-full">
                        <img src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                        </div>
                    </div>
                    <div className="flex flex-col justify-center items-center mx-2 w-full">
                        {user}
                        <progress className="progress progress-success w-full h-10" value="60" max="100">asdas</progress>
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
            <input value={gameState.currentParagraph} onPaste={(e) => {e.preventDefault();}} onChange={handleInputChange} placeholder="Start typing here" className="input input-md input-bordered"></input>
        </div>
        
        <button className="btn btn-primary" onClick={startCountDown}></button>
        <button className="btn btn-primary" onClick={() => {
            // console.log(document.getElementById("gostart"));
            document.getElementById("gostart").play();
            }}>Test Start</button>
        <audio id="gostart"><source src={goSound}></source></audio>
        {counter > 0 &&
        
            <div className="inset-0 z-10 fixed flex items-center justify-center p-4">
                <p className="text-9xl font-bold bg-base-300"></p>
                <span className="countdown">
                <   span className="text-9xl" style={{"--value":{counter}}}></span>
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