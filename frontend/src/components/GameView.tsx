import { useState } from "react"


const GameView = () => {
    
    const mockUsers = ['User1', "Dylan", "Chris", "Steve", "Steve", "Steve", "Steve"]

    const [typeInput, setInputValue] = useState('');

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    }

    const testTypingText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

    const comparisonText = () =>{
        let text = [];
        for (let i =0; i < testTypingText.length; i++){
            const truthChar = testTypingText[i];
            let acutalChar = undefined;

            if (typeInput.length > i){
                acutalChar = typeInput[i];
                console.log(typeInput.length, truthChar, acutalChar)
            }

            if (acutalChar === undefined){
                // console.log("Undefined")
                text.push(<span className="text-base-content">{truthChar}</span>);
            }
            else if(truthChar !== acutalChar){
                console.log("Error")
                text.push(<span className="text-error">{truthChar}</span>);
            }
            else{
                console.log("Success")
                text.push(<span className="text-success">{truthChar}</span>);
            }
        }
        // console.log(text)
        return text;
    }   

    return(
        <div>
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
            <input value={typeInput} onPaste={(e) => {e.preventDefault();}} onChange={handleInputChange} placeholder="Start typing here" className="input input-md input-bordered"></input>
        </div>

        </div>
    )
}

export default GameView