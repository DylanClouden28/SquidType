export interface Player{
    Username: string;
    IsDead: Boolean;
    CurrentPercentage: string;
}

export interface GameState{
    Players: Player[];
    currentRound: number;
    currentLight: 'off' | 'red' | 'green' | 'yellow';
    TargetParagraph: string
    currentParagraph: string
}