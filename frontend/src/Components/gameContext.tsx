import React, { useContext, useState } from 'react'
import { GameState } from '../interfaces/game'

export const GameContext = React.createContext<{
    gameState: GameState;
    setGameState: (gameState: Partial<GameState>) => void;
} | undefined>(undefined)

export const useGameState = () => {
    const context = useContext(GameContext)
    if (context === undefined){
        throw new Error("Not in context for gameContext")
    }
    return context;
}

interface Props {
    children: React.ReactNode;
}

export const GameStateProvider: React.FunctionComponent<Props> = (
    props: Props
): JSX.Element => {

    const [gameState, setGame] = useState<GameState>({
        Players: [],
        currentRound: 0,
        currentLight: 'green',
        TargetParagraph: '',
        currentParagraph: '',
        currentState: 'lobby',
        countDown: 60,
    })

    const setGameState = (update: Partial<GameState>) => {
        setGame(prevGame => ({...prevGame, ...update}));
    }

    return (
        <GameContext.Provider value={{gameState, setGameState}}>
            {props.children}
        </GameContext.Provider>
    )
}