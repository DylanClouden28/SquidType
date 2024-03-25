import sendIcon from '../assets/send-svgrepo-com.svg'
import EmojiPicker from 'emoji-picker-react';
import { useEffect, useState } from 'react';

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
    const [username, setUsername] = useState("")
    const [currentMessage, setCurrentMessage] = useState(null)
    const [messageInput, setMessageInput] = useState("")
    const [isEmojiDropDown, setEmojiDropDown] = useState(false);

    useEffect(() =>{
        getUser();
        getMessages();
        console.log("Polling")
        setInterval(() => {getMessages();}, 1000);
    }, [])

    const getUser = async () => {
        try{
            const response = await fetch("http://localhost:8000/auth/get-user", {
              method: "POST",
              mode: 'cors',
              credentials: "include"
            })
            if (!response.ok){
              const {err} = await response.json()
              console.log(err)
            }
  
            const body = await response.json()
  
            setUsername(body);
            
          } catch (error){
              console.log(error)
          }
    }

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

          const body = await response.json()

          setMessages(body);

          const lastMessage = body[body.length - 1]
          messageScroll(lastMessage.uuid)
          
        } catch (error){
            console.log(error)
        }
    }

    const sendMessage = async (message: string) => {
        try{
            if (message == ''){
                return
            }
            const response = await fetch("http://localhost:8000/message/send-message", {
              method: "POST",
              mode: 'cors',
              body: JSON.stringify({
                content: message
              }),
              credentials: "include"
            })
            if (!response.ok){
              const {err} = await response.json()
              console.log(err)
            }

            setMessageInput('')
  
            await getMessages();
            
        } catch (error){
            console.log(error)
        }
    }

    const sendEmoji = async (emoji: string) => {
        try{
            if(emoji === undefined){
                return 
            }
            if(currentMessage === null){
                return
            }
            const response = await fetch("http://localhost:8000/message/send-emoji", {
              method: "POST",
              mode: 'cors',
              body: JSON.stringify({
                emoji: emoji,
                username: username,
                message_id: currentMessage
              }),
              credentials: "include"
            })
            if (!response.ok){
              const {err} = await response.json()
              console.log(err)
            }
  
            await getMessages();
            
        } catch (error){
            console.log(error)
        }
    }


    const handleEmojiSelect = (emojiObj: any, event: any) => {
        setEmoji(emojiObj)
        console.log(emojiObj.emoji)
        console.log("closing")
        setEmojiDropDown(false)
        sendEmoji(emojiObj.emoji);
    }

    const messageScroll = async (lastMsg: string) => {
        const Element = document.getElementById(lastMsg)
        if (Element === undefined || Element === null){
          return
        }
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
        Element.scrollIntoView({behavior: "smooth"})
      }

    return(
        <div className="p-4 bg-base-300 min-h-screen" data-theme="night">
            <div className="navbar bg-base-100 rounded-box shadow-xl mb-10 lg:mb-40 p-4">
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
                <div className="card w-5/6 xl:w-6/12 2xl:w-4/12 shadow-2xl bg-base-200">
                    <div className="chatBox p-2 h-[30rem] lg:h-[40rem] overflow-auto overflow-x-hidden">
                            { messages.length > 0 && messages.map(message =>
                            <div className={username === message?.user ? "chat chat-end" : "chat chat-start"}>
                                <div className={username === message?.user ? "chat-header mr-2" : "chat-header ml-2"}>
                                {message?.user}
                                <time className="text-xs opacity-50 px-1">{new Date(message?.date)?.toLocaleString("en-US", {hour: "2-digit", minute: "2-digit"})}</time>
                                </div>
                                <div className="chat-bubble m-1 hover:bg-base-100" id={message.uuid} role="button" onClick={() => {
                                    setEmojiDropDown(!isEmojiDropDown);
                                    setCurrentMessage(message?.uuid);
                                    }}>
                                        <div className='tooltip' data-tip="Click to add Emoji">
                                        {message?.content}
                                        </div>
                                    </div>
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
                            <input className="input max-sm:input-sm input-bordered flex-grow mx-2" placeholder="Type here" value={messageInput} type="text" onChange={e => {setMessageInput(e.target.value)}}/>
                            <img onClick={() => {sendMessage(messageInput)}} className="btn max-sm:btn-sm btn-accent p-2" src={sendIcon}></img>
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