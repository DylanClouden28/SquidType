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
import { baseWSMessage, ChatMessage, chatWSMessage, gameStateUpdate, lobbyStateUpdate, overAllGameUpdate, Reaction, reactionWSMessage } from '../interfaces/websockets';
import { useGameState } from '../Components/gameContext';

const CONNECTION_STATUS_CONNECTING: number = 0;
const CONNECTION_STATUS_OPEN: number =  1;
const CONNECTION_STATUS_CLOSING: number  = 2;
const CONNECTION_STATUS_CLOSED: number  = 3;

const enablePolling = false;

const mockPlayers: Player[] = [
    // {
    //     Username: "Winner",
    //     IsDead: true,
    //     CurrentPercentage: "90",
    //     isReady: false,
    //     WPM: 40,
    //     lastRoundWPM: 50,
    //     Rank: 10,
    // },
    // {
    //     Username: "Second",
    //     IsDead: false,
    //     CurrentPercentage: "40",
    //     isReady: false,
    //     WPM: 50,
    //     lastRoundWPM: 70,
    //     Rank: 9,
    // },
    // {
    //     Username: "Third",
    //     IsDead: false,
    //     CurrentPercentage: "50",
    //     isReady: false,
    //     WPM: 60,
    //     lastRoundWPM: 50,
    //     Rank: 8,
    // },
    // {
    //     Username: "Steve",
    //     IsDead: false,
    //     CurrentPercentage: "30",
    //     isReady: false,
    //     WPM: 70,
    //     lastRoundWPM: 30,
    //     Rank: 7,
    // },
    // {
    //     Username: "Steve",
    //     IsDead: false,
    //     CurrentPercentage: "30",
    //     isReady: false,
    //     WPM: 80,
    //     lastRoundWPM: 20,
    //     Rank: 7,
    // },
    // {
    //     Username: "Steve",
    //     IsDead: false,
    //     CurrentPercentage: "30",
    //     isReady: false,
    //     WPM: 90,
    //     lastRoundWPM: 10,
    //     Rank: 7,
    // },
]

function home(){
    const baseUrl: string = import.meta.env.VITE_Backend_URL
    const baseWSUrl: string = import.meta.env.VITE_Backend_URL_WS
    const [emoji, setEmoji] = useState(null)
    const [messages, setMessages] = useState<ChatMessage[]>()
    const [isHelp, setIsHelp] = useState(true);
    const [username, setUsername] = useState("");
    const [currentMessage, setCurrentMessage] = useState(undefined)
    const [messageInput, setMessageInput] = useState("")
    const [isEmojiDropDown, setEmojiDropDown] = useState(false);
    const [finalImage, setFinalImage] = useState("");
    const [cropData, setCropData] = useState("");
    const [lastMess, setLastMess] = useState<ChatMessage | undefined>(undefined);
    const [textError, setTextError] = useState<undefined | string>(undefined);
    const [textTimeout, setTextTimeout] = useState(false);
    const [counter, setCounter]= useState(-1);

    // const [gameState, setGameState] = useState<GameState>({
    //     Players: [],
    //     currentRound: 0,
    //     currentLight: 'green',
    //     TargetParagraph: '',
    //     currentParagraph: '',
    //     currentState: 'lobby',
    //     countDown: 60,
    // })

    const [gameState, setGameState] = useState<GameState>({
        Players: [],
        currentLight: 'green',
        currentRound: 0,
        currentState: 'lobby',
        TargetParagraph: "",
        currentParagraph: "",
        countDown: 10,
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
    

    const {sendMessage, lastMessage, readyState} = useWebSocket(baseWSUrl + '/ws/', options);
    
    const addNewChatMessage = (message: ChatMessage) => {
        setMessages(prevMessages => {
            console.log("messages", messages)
            if(prevMessages === undefined){
                console.log("no messages")
                return[message]
            }
            console.log("Add new messages")
            return[...prevMessages, message]
        })
        console.log("New message has been added")
        setLastMess(message);
    }

    const addNewReaction = (reaction: Reaction) => {
        console.log("trying to add reaction")
        console.log("emoji messages", messages)
        setMessages(prevMessages => {
            if (prevMessages === undefined){
                return
            }
            const updatedMessages = prevMessages.map(message => {
                if (message.uuid === reaction.message_id){
                    const newMessage = {
                        ...message,
                        reaction: [...message.reaction, reaction]
                    }
                    return newMessage;
                }
                return message;
            });

            return updatedMessages
        });
    }
    
    const handleNewMessage = (message: string) => {
        
        try {
            const resultJson = JSON.parse(message);
            let messageType = ""
            console.log("Recieved json over websocket:", resultJson)
            if (resultJson.MessageType === undefined && resultJson.messageType === undefined){
                console.log("MessageType was no defined in websocket data");
                return
            }
            if (resultJson.MessageType){
                messageType = resultJson.MessageType;
            }
            else{
                messageType = resultJson.messageType;
            }
            console.log("Recieved messageType:", messageType)
            if (messageType == "chatMessage"){
                const chatMess: chatWSMessage = resultJson;
                console.log("Recvied chatMessage", chatMess)
                addNewChatMessage(chatMess.data.message)
            }

            if (messageType == "reactionMessage"){
                const reactionMess: reactionWSMessage = resultJson;
                console.log("Receieved reaction message")
                addNewReaction(reactionMess.data.reaction)
            }

            if (messageType == "pingMessage"){
                console.log("Recieved ping message")
                const Pong: baseWSMessage = {
                    messageType: "pongMessage"
                }
                sendMessage(JSON.stringify(Pong));
            }


            if (messageType == "stateUpdate"){
                console.log("Receving state Update")
                if (resultJson.currentState === undefined){
                    return
                }
                if (gameState === undefined){
                    return
                }
                const currentStateType = resultJson.currentState

                if (currentStateType == "game"){
                    

                    const newGameStateUpdate: gameStateUpdate = resultJson;
                    
                    console.log("Recevied gameUpdate")
                    setGameState(prevState => ({
                        ...prevState,
                        Players: newGameStateUpdate.players,
                        currentState: newGameStateUpdate.currentState,
                        TargetParagraph: newGameStateUpdate.targetMessage,
                        currentParagraph: ""
                    }))
                    startCountDown();
                }

                if (currentStateType == "lobby"){
                    const newGameStateUpdate: lobbyStateUpdate = resultJson;
                    
                    console.log("Recevied lobbyUpdate")
                    setGameState(prevState => ({
                        ...prevState,
                        Players: newGameStateUpdate.players,
                        currentState: newGameStateUpdate.currentState,
                        TargetParagraph: newGameStateUpdate.targetMessage,
                    }))
                }

                if (currentStateType == "winner"){
                    const newGameStateUpdate: lobbyStateUpdate = resultJson;
                    
                    console.log("Recevied lobbyUpdate")
                    setGameState(prevState => ({
                        ...prevState,
                        Players: newGameStateUpdate.players,
                        currentState: "winner",
                        TargetParagraph: newGameStateUpdate.targetMessage,
                    }))
                }
                
            }

            if (messageType == "gameUpdate"){
                const newGameStateUpdate: overAllGameUpdate = resultJson;
                    
                console.log("Recevied gameUpdate")
                // if (newGameStateUpdate.currentLight !== gameState.currentLight){
                //     document.getElementById("lightChange").play();
                // }
                setGameState(prevState => {
                
                    return {
                        ...prevState,
                        Players: newGameStateUpdate.players,
                        currentLight: newGameStateUpdate.currentLight as "red" | "green" | "yellow" | "off",
                        currentState: newGameStateUpdate.currentState as 'lobby' | 'game' | 'winner' | 'betweenRound',
                        countDown: newGameStateUpdate.countDown
                    }
            })
            }
        }
        catch (error){
            console.log("Error handling new websocket message", error)
        }

    }

    useEffect(() => {
        if (document.getElementById("lightChange")){
            document.getElementById("lightChange").play();
            document.getElementById("lightChange").volume = 0.1;
        }
    }, [gameState.currentLight])

    useEffect(() => {
        console.log("Game State has been updated: ", gameState)
    }, [gameState])
        
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

    useEffect(() => {
        if (lastMess === undefined){
            return
        }
        if (lastMess !== undefined){
            messageScroll(lastMess.uuid)
        }
    }, [lastMess])

    // const openModal = () => {
    //     setIsModalOpen(true);
    // };

    // const closeModal = () => {
    //     setIsModalOpen(false);
    // };

    const getUser = async () => {
        try{
            const response = await fetch(baseUrl + "/auth/get-user", {
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
            const response = await fetch(baseUrl + "/auth/signout", {
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
          const response = await fetch(baseUrl + "/message/get-messages", {
            method: "GET",
            mode: 'cors'
          })
          if (!response.ok){
            const {err} = await response.json()
            console.log(err)
          }

          const body = await response.json()

          setMessages(body);
          setTimeout(()=> {
              const lastMessage = body[body.length - 1]
              messageScroll(lastMessage.uuid)
          }, 200)
          console.log("The current messages are after fetching", messages)
        } catch (error){
            console.log(error)
        }
    }

    const sendTextMessage = async (message: string) => {
        try{
            if (message == ''){
                return
            }
            setTextError(undefined);
            if (textTimeout === true){
                setTextError("Please wait a second before sending a message");
                return 
            }
            if (message.length > 100){
                setTextError("Please send a message under 100 characters");
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
            setMessageInput('')
            setTextTimeout(true);
            setTimeout(() => {
                setTextTimeout(false);
            }, 3000);
            
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
                "messageType": "reactionMessage",
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
            return `${baseUrl}/public/images/${username}.png`;
        }
        return LiterallyHim;
    }

    const startCountDown = () => {
        console.log("Recieved message to start countdown")
        setCounter(10);
    
        const id = setInterval(() => {
            setCounter((prevCount) => {
                if (prevCount === 4){
                    document.getElementById("gostart").play();
                }
                if (prevCount === -1){
                    clearInterval(id)
                }
                if (prevCount === 0){
                    document.getElementById("game-input")?.focus()
                }
                return prevCount - 1;
            })
        }, 1000) 
    }

    console.log("PAGE REFRESHING")

    return(
        <div className="bg-base-300 min-h-screen" data-theme="night">
            <div className="w-48 fixed m-4">
                {/* <p className='font-Consolas'><span className='text-error text-bold px-2 text-4xl '>SQUID </span><span className='text-bold text-4xl'> TYPE</span></p> */}
                <img className='ml-4 w-24'src={Logo} alt="SquidType"></img>
            </div>
            <div className='flex'>
                <div className='w-2/3 h-fit'>
                    {/* //&& readyState == CONNECTION_STATUS_OPEN  &&   */}
                    {gameState && readyState == CONNECTION_STATUS_OPEN  &&<Game gameState={gameState} setGameState={setGameState} username={username} sendMessage={sendMessage}/>}
                </div>

                <div className="grid justify-items-center w-1/3 h-10">
                    <div className="navbar bg-base-100 rounded-box shadow-xl mb-10 p-10 justify-end w-5/6 m-4">
                        <div className="">
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
                                        <img  src={username === message?.user ? getImageSrc(): `${baseUrl}/public/images/${message?.user}.png`} alt="no pfp" />
                                        </div>
                                    </div>
                                    <div className={username === message?.user ? "chat-header mr-2" : "chat-header ml-2"}>
                                    {message?.user}
                                    <time className="text-xs opacity-50 mx-1">{new Date(message?.date)?.toLocaleString("en-US", {hour: "2-digit", minute: "2-digit"})}</time>
                                    </div>
                                    <div className="chat-bubble hover:bg-base-100 max-w-96 text-clip overflow-hidden" id={message.uuid} role="button" onClick={() => {
                                        setEmojiDropDown(!isEmojiDropDown);
                                        console.log("setting emoji to message uuid of ", message.uuid)
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

                        <div className={textError ? "card-body p-2 tooltip tooltip-open tooltip-accent" : "card-body p-2"} data-tip={textError} >
                            <div className="flex">
                                <input onKeyDown={e => {
                                    if (e.key == "Enter"){
                                        sendTextMessage(messageInput)
                                    }
                                }} 
                                className="input max-sm:input-sm input-bordered flex-grow mx-2 "
                                placeholder="Type here" value={messageInput} type="text" onChange={e => {setMessageInput(e.target.value)}}/>
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
                {counter > -1 &&
        
                    <div className="inset-0 z-10 fixed flex items-center justify-center p-4">
                        <p className="text-9xl font-bold bg-base-300"></p>
                        <span className="countdown">
                        <span className="text-9xl" style={{"--value":counter}}></span>
                        </span>
                    </div>
                
                }

            </div>

    )
}
export default home;