import sendIcon from '../assets/send-svgrepo-com.svg'
import EmojiPicker from 'emoji-picker-react';
import { useState } from 'react';

function home(){

    // const mockData = [{user: "bob",
    //         content: "hello",
    //         Date: new Date(Date.now()),
    //         reaction: [{
    //             username: "otheruser",
    //             emoji: "😀",
    //             messageId: "123123123"
    //         },
    //         {
    //             username: "chris",
    //             emoji: "😀",
    //             messageId: "123123123"
    //         }
    //     ],
    //         id: "jklasdfasdfasdf"  
    //     },]

    const [emoji, setEmoji] = useState(null)
    const [messages, setMessages] = useState([])
    const [isEmojiDropDown, setEmojiDropDown] = useState(false);
    const username = "bob"

    const getMessages = async () => {
        try{
          const response = await fetch("http://localhost:8000/message/get-messages", {
            method: "GET",
            mode: 'cors'
          })
          if (!response.ok){
            const {err} = await response.json()
            console.log(err)
          }

          const {resMessages} = await response.json()

          setMessages(resMessages);
          
        } catch (error){
            console.log(error)
        }
    }

    const sendMessage = async () => {
        try{
            const response = await fetch("http://localhost:8000/message/send-message", {
              method: "POST",
              mode: 'cors',
              body: {
                
              }
            })
            if (!response.ok){
              const {err} = await response.json()
              console.log(err)
            }
  
            const {resMessages} = await response.json()
  
            setMessages(resMessages);
            
        } catch (error){
            console.log(error)
        }
    }


    console.log(messages)

    const handleEmojiSelect = (emojiObj: any, event: any) => {
        setEmoji(emojiObj)
        console.log(emojiObj.emoji)
        console.log("closing")
        setEmojiDropDown(false)
    }

    return(
        <div className="p-4 bg-base-300 min-h-screen" data-theme="night">
            <div className="navbar bg-base-100 rounded-box shadow-xl mb-40 p-4">
            <div className="flex-1">
                <a className="btn btn-ghost text-xl">Home Page</a>
            </div>
            <div className="navbar-end">
                <div className="dropdown dropdown-bottom dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                </div>
                <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                    <li><a>Signout</a></li>
                </ul>
                </div>
            </div>
            </div>

            <div className="grid justify-items-center">
                <div className="card w-3/5 shadow-2xl max-w-3xl bg-base-200">
                    <div className="chatBox p-2 h-[40rem] overflow-auto overflow-x-hidden">
                            { messages.length > 0 && messages.map(message =>
                            <div className={username === message?.user ? "chat chat-end" : "chat chat-start"}>
                                <div className={username === message?.user ? "chat-header mr-2" : "chat-header ml-2"}>
                                {message?.user}
                                <time className="text-xs opacity-50 px-1">{message?.Date?.toLocaleString("en-US", {hour: "2-digit", minute: "2-digit"})}</time>
                                </div>
                                <div className="chat-bubble m-1 hover:bg-base-100" role="button" onClick={() => {setEmojiDropDown(!isEmojiDropDown)}}>
                                        <div className='tooltip' data-tip="Click to add Emoji">
                                        {message?.content}
                                        </div>
                                    </div>
                                {/* <div className="chat-bubble">I hate you!</div> */}
                                <div className="chat-footer">
                                    {message?.reaction && message?.reaction !== null && message.reaction.map(reaction => 
                                    <div className="badge badge-neutral mx-1 tooltip" data-tip={reaction?.username}>
                                        <span >{reaction?.emoji}</span>
                                    </div>
                                    )}
                                </div>
                            </div>    
                            )}
                    </div>

                    <div className="card-body p-2">
                        <div className="flex">
                            <input className="input input-bordered flex-grow mx-2" placeholder="Type here" type="text" />
                            <img className="btn btn-accent p-2" src={sendIcon}></img>
                        </div>
                    </div>
                    <div className="dropdown dropdown-top dropdown-end">
                            <div id="card-body" className=''> 
                                {isEmojiDropDown &&
                                    <ul className="dropdown-content shadow-xl z-[50] !visible !opacity-100">
                                        <li><EmojiPicker onEmojiClick={handleEmojiSelect} open={true}/></li>
                                    </ul>
                                }
                            </div>
                    </div>
                </div>
            </div>
            </div>
    )
}
export default home;