import sendIcon from '../assets/send-svgrepo-com.svg'
import LiterallyHim from '../assets/LiterallyHim.jpg'
import EmojiPicker from 'emoji-picker-react';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Game from '../components/Game';
import Logo from '../assets/SquidType.png'
import { useNavigate } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';

import Modal from '../components/Modal'

import '../App.css'

import {GameState, Player} from '../interfaces/game'
import { baseWSMessage, ChatMessage, chatWSMessage, Reaction, reactionWSMessage } from '../interfaces/websockets';

const CONNECTION_STATUS_CONNECTING: number = 0;
const CONNECTION_STATUS_OPEN: number =  1;
const CONNECTION_STATUS_CLOSING: number  = 2;
const CONNECTION_STATUS_CLOSED: number  = 3;

const enablePolling = false;

const mockPlayers: Player[] = [
    {
        Username: "Dylan",
        IsDead: true,
        CurrentPercentage: "90",
        isReady: false,
        WPM: 40,
        lastRoundWPM: 50,
    },
    {
        Username: "Steve",
        IsDead: false,
        CurrentPercentage: "40",
        isReady: false,
        WPM: 50,
        lastRoundWPM: 70,
    },
    {
        Username: "Steve",
        IsDead: false,
        CurrentPercentage: "50",
        isReady: false,
        WPM: 60,
        lastRoundWPM: 50,
    },
    {
        Username: "Steve",
        IsDead: false,
        CurrentPercentage: "30",
        isReady: false,
        WPM: 70,
        lastRoundWPM: 30,
    },
    {
        Username: "Steve",
        IsDead: false,
        CurrentPercentage: "30",
        isReady: false,
        WPM: 80,
        lastRoundWPM: 20,
    },
    {
        Username: "Steve",
        IsDead: false,
        CurrentPercentage: "30",
        isReady: false,
        WPM: 90,
        lastRoundWPM: 10,
    },
]

function home(){
    const [emoji, setEmoji] = useState(null)
    const [messages, setMessages] = useState<ChatMessage[]>()
    const [isHelp, setIsHelp] = useState(true);
    const [username, setUsername] = useState("");
    const [currentMessage, setCurrentMessage] = useState(null)
    const [messageInput, setMessageInput] = useState("")
    const [isEmojiDropDown, setEmojiDropDown] = useState(false);
    const [finalImage, setFinalImage] = useState("");
    const [cropData, setCropData] = useState("");

    const [gameState, setGameState] = useState<GameState>({
        Players: mockPlayers,
        currentRound: 0,
        currentLight: 'green',
        TargetParagraph: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        currentParagraph: '',
        currentState: 'game',
        countDown: 60,
    })

    const options = useMemo(() => ({
        onMessage: (message) => {
            console.log("Recieved message", message.data)
            handleNewMessage(message.data)
        },
        onClose: event => console.log('onClose', event),
        onError: error => console.log('onError', error),
        onOpen: event => console.log('onOpen', event),
    }),[]);
    

    const {sendMessage, lastMessage, readyState} = useWebSocket('ws://localhost:8000/ws/', options);
    
    const connectionStatus = {
        [CONNECTION_STATUS_CONNECTING]: 'Connecting',
        [CONNECTION_STATUS_OPEN]: 'Open',
        [CONNECTION_STATUS_CLOSING]: 'Closing',
        [CONNECTION_STATUS_CLOSED]: 'Closed',
      }[readyState];

    const addNewChatMessage = (message: ChatMessage) => {
        if( messages === undefined){
            setMessages([message])
            return
        }
        setMessages([...messages, message])
        messageScroll(message.uuid)
    }

    const addNewReaction = (reaction: Reaction) => {
        const currentMessages = messages;
        if (currentMessages === undefined){
            return
        }
        const messageToChange = currentMessages.find(message => {
            return message.uuid === reaction.message_id
        })

        if (messageToChange === undefined){
            console.log("Could not find message to add emoji too")
            return
        }

        messageToChange.reactions.push(reaction); 

        setMessages(currentMessages);
    }
    
    const handleNewMessage = (message: string) => {
        
        try {
            const resultJson = JSON.parse(message);
            console.log("Recieved json over websocket:", resultJson)
            if (resultJson.messageType !== undefined){
                console.log("MessageType was no defined in websocket data");
                return
            }
            const messageType = resultJson.messageType;

            if (messageType == "chatMessage"){
                const chatMess: chatWSMessage = resultJson;
                console.log("Recvied chatMessage", chatMess)
                addNewChatMessage(chatMess.Data.message)
            }

            if (messageType == "reactionMessage"){
                const reactionMess: reactionWSMessage = resultJson;
                console.log("Receieved reaction message")
                addNewReaction(reactionMess.Data.reaction)
            }

            // if (messageType == "roundStart"){
            //     console.log("Recvied roundStart")
            // }

            // if (messageType == "gameUpdate"){
            //     console.log("Recevied gameUpdate")
            //     const newGameState: GameState = {
            //         Players: resultJson?.Players,
            //         currentRound: resultJson?.currentRound,
            //         currentLight: resultJson?.currentLight,
            //         TargetParagraph: resultJson?.TargetMessage,
            //         currentParagraph: gameState.currentParagraph,
            //         currentState: resultJson?.currentState,
            //         countDown: resultJson?.countDown,
            //     }
            //     setGameState(newGameState)
            // }
        }
        catch (error){
            console.log("Error handling new websocket message", error)
        }

    }

    const handleTypingMessage = useCallback(() => {
        const message = JSON.stringify({
            messageType: 'input',
            text: gameState?.currentParagraph
        })
        sendMessage(message);
    }, []);

    
    
    const nav = useNavigate();

    // const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() =>{
        getUser();
        getMessages();
        console.log("Polling")
        if (enablePolling){
            setInterval(() => {getMessages();}, 1000);
        }
    }, [])

    // const openModal = () => {
    //     setIsModalOpen(true);
    // };

    // const closeModal = () => {
    //     setIsModalOpen(false);
    // };

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
              nav('/login')
            }
  
            const body = await response.json()
  
            setUsername(body);
            
          } catch (error){
              console.log(error)
          }
    }

    const signOut = async () => {
        try{
            const response = await fetch("http://localhost:8000/auth/signout", {
              method: "POST",
              mode: 'cors',
              credentials: "include"
            })
            if (!response.ok){
              const {err} = await response.json()
              console.log(err)
            }
  
            nav('/login')
            
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

    const sendTextMessage = async (message: string) => {
        try{
            if (message == ''){
                return
            }
            const messData = JSON.stringify({
                "messageType": "chatMessage",
                "Data": {
                    "message": {
                        "content": message
                    }
                }
            })
            sendMessage(messData);
            
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
            const reactionData = JSON.stringify({
                "messageType": "chatMessage",
                "Data": {
                    "reaction": {
                        emoji: emoji,
                        message_id: currentMessage
                    }
                }
            })
            sendMessage(reactionData);
            
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
        Element.scrollIntoView({behavior: "smooth"})
    }

    const getImageSrc = () => {
        if (finalImage) {
            return finalImage;
        }
        if (username){
            return `http://localhost:8000/public/images/${username}.png`;
        }
        return LiterallyHim;
    }

    return(
        <div className="p-4 bg-base-300 min-h-screen" data-theme="night">
            <div className="navbar bg-base-100 rounded-box shadow-xl mb-10 p-4">
            <div className="navbar-start">
                {/* <p className='font-Consolas'><span className='text-error text-bold px-2 text-4xl '>SQUID </span><span className='text-bold text-4xl'> TYPE</span></p> */}
                <img className='ml-4 w-32'src={Logo} alt="SquidType"></img>
            </div>
            <div className="navbar-end">
                <h1 className='text-2xl px-4'>{username}</h1>
                <div className="avatar">
                    <div className="rounded-full mr-2 w-14 h-14">
                    <img
                        className="p-0"
                        src={getImageSrc()}
                    />
                    </div>
                </div>
                <Modal cropData={cropData} setCropData={setCropData} setFinalImage={setFinalImage} finalImage={finalImage}/>
                <button className='btn btn-neutral' onClick={signOut}>Signout</button>
                {/* <button className='btn btn-neutral' onClick={openModal}>Open Modal</button> */}
            </div>
            </div>

            <div className='flex'>
                <div className='w-2/3 h-fit'>
                    <Game gameState={gameState} setGameState={setGameState} username={username}/>
                </div>

                <div className="grid justify-items-center w-1/3 h-10">
                    {isHelp && 
                    <div role="alert" className="alert alert-info max-w-2xl mb-5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>Create messages below, react to messages by clicking on message and choosing reaction! Hover over reaction to see user!</span>
                        <div>
                            <button onClick={() => {setIsHelp(false)}} className="btn btn-ghost btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>
                    }

                    <div className="card w-5/6 shadow-2xl bg-base-200 p-4">
                        <div className={isHelp ? "chatBox p-2 h-[20rem] 2xl:h-[32rem] overflow-auto overflow-x-hidden" : "chatBox p-2 h-[25rem] lg:h-[28rem] 2xl:h-[38rem] overflow-auto overflow-x-hidden"}>
                                { messages && messages.length > 0 && messages.map(message =>
                                <div className={username === message?.user ? "chat chat-end" : "chat chat-start"}>
                                    <div className="chat-image avatar">
                                        <div className="w-10 rounded-full">
                                        <img alt="Tailwind CSS chat bubble component" src={username === message?.user ? getImageSrc(): `http://localhost:8000/public/images/${message?.user}.png`} />
                                        </div>
                                    </div>
                                    <div className={username === message?.user ? "chat-header mr-2" : "chat-header ml-2"}>
                                    {message?.user}
                                    <time className="text-xs opacity-50 mx-1">{new Date(message?.date)?.toLocaleString("en-US", {hour: "2-digit", minute: "2-digit"})}</time>
                                    </div>
                                    <div className="chat-bubble hover:bg-base-100" id={message.uuid} role="button" onClick={() => {
                                        setEmojiDropDown(!isEmojiDropDown);
                                        setCurrentMessage(message?.uuid);
                                        }}>
                                            <div className='tooltip' data-tip="Click to add Emoji">
                                            {message?.content}
                                            </div>
                                        </div>
                                    <div className="chat-footer">
                                        {message?.reaction && message?.reaction !== null && message.reaction.map(reaction => 
                                        <div className="badge badge-neutral mx-1 mt-1 tooltip" data-tip={reaction?.username}>
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
                                <img onClick={() => {sendTextMessage(messageInput)}} className="btn max-sm:btn-sm btn-accent p-2" src={sendIcon}></img>
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

            </div>

    )
}
export default home;