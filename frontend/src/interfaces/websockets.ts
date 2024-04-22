export interface Reaction{
    username: string;
    emoji: string;
    message_id: string;
}

export interface ChatMessage{
    user: string;
    content: string;
    date: Date;
    reactions: Reaction[];
    uuid: string;
}


export interface baseWSMessage{
    messageType: string;
}

export interface chatWSMessage extends baseWSMessage{
    Data: {
        message: ChatMessage;
    }
}

export interface reactionWSMessage extends baseWSMessage{
    Data: {
        reaction: Reaction;
    }
}