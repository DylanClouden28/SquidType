export interface Player{
    Username: string;
    IsDead: Boolean;
    CurrentPercentage: string;
    IsReady: false;
    WPM: number
    lastRoundWPM: number
}

export interface GameState{
    Players: Player[];
    currentRound: number;
    currentLight: 'off' | 'red' | 'green' | 'yellow';
    TargetParagraph: string
    currentParagraph: string
    currentState: 'lobby' | 'game' | 'winner' | 'betweenRound'
    countDown: number
}