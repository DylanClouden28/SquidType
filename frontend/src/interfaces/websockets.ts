import { Player } from "./game";

export interface Reaction{
    username: string;
    emoji: string;
    message_id: string;
}

export interface ChatMessage{
    user: string;
    content: string;
    date: Date;
    reaction: Reaction[];
    uuid: string;
}

export interface baseWSMessage{
    messageType: string;
}

export interface chatWSMessage extends baseWSMessage{
    data: {
        message: ChatMessage;
    }
}

export interface reactionWSMessage extends baseWSMessage{
    data: {
        reaction: Reaction;
    }
}

export interface ReadyWSMessage extends baseWSMessage{
    data: {
        isReady: boolean;
    }
}

export interface baseStateUpdate extends baseWSMessage {
    currentState: 'lobby' | 'game' | 'winner' | 'betweenRound'
}

export interface gameStateUpdate extends baseStateUpdate {
    currentState: 'game'
    players: Player[]
    targetMessage: string
}

export interface lobbyStateUpdate extends baseStateUpdate {
    currentState: 'lobby'
    players: Player[]
    targetMessage: string
}

export interface overAllGameUpdate extends baseWSMessage {
    players: Player[]
    currentState: string
    currentLight: string
    countDown: number
}