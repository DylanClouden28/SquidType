import { GameState } from "../interfaces/game"

interface winnerViewProps {
    gameState: GameState
    setGameState: React.Dispatch<React.SetStateAction<GameState>>
    username: string
}

const WinnerView: React.FC<winnerViewProps> = ({gameState, setGameState, username}) => {

    const baseUrl: string = import.meta.env.VITE_Backend_URL

    const sortedPlayers = gameState.Players.sort((a, b) => {
        return Number(b.Rank) - Number(a.Rank)
    })

    return (
        <div className="bg-base-300 card">
            <div className="card-body flex flex-row gap-10 justify-end items-end p-48">
                {gameState.Players.length > 1 &&
                <div className="card h-64 w-32 bg-base-100">
                    <div className="card-body p-0 justify-top items-center gap-y-0">
                        <div className="avatar flex flex-col h-20 p-2 w-20 justify-center items-center mt-4">
                            <div className={"rounded-full ring ring-silver"}>
                                <img src={`${baseUrl}/public/images/${sortedPlayers[1].Username}.png`} alt="no profile" />
                            </div>
                        </div>
                        <span className={sortedPlayers[1].Username == username ? "text-bold text-lg": "text-bold text-xl text-secondary"}>{sortedPlayers[1].Username}</span>
                        <span className="p-0 m-0">WPM: <span className="text-silver">{sortedPlayers[1].WPM}</span></span>
                        <span className="text-5xl italic font-bold font-mono text-silver">#2</span>
                    </div>
                </div>
                }

                {gameState.Players.length > 0 &&
                <div className="card h-96 w-32 bg-base-100 ">
                    <div className="card-body p-0 justify-top items-center gap-y-0">
                        <div className="avatar flex flex-col h-20 w-20  justify-center items-center mt-4">
                            <div className={"rounded-full ring ring-gold"}>
                                <img src={`${baseUrl}/public/images/${sortedPlayers[0].Username}.png`} alt="no profile" />
                            </div>
                        </div>
                        <span className={sortedPlayers[0].Username == username ? "text-bold text-lg mt-2": "text-bold text-xl text-secondary mt-2"}>{sortedPlayers[0].Username}</span>
                        <span>WPM: <span className="text-gold">{sortedPlayers[0].WPM}</span></span>
                        <span className="text-5xl italic font-bold font-mono text-gold" >#1</span>
                    </div>
                </div>
                }

                {gameState.Players.length > 2 &&
                <div className="card h-48 w-32 bg-base-100">
                    <div className="card-body p-0 justify-top items-center gap-y-0">
                        <div className="avatar flex flex-col h-20 w-20 p-3 justify-center items-center mt-4 ">
                            <div className={"rounded-full ring ring-bronze"}>
                                <img src={`${baseUrl}/public/images/${sortedPlayers[2].Username}.png`} alt="no profile" />
                            </div>
                        </div>
                        <span className={sortedPlayers[2].Username == username ? "text-bold text-lg": "text-bold text-xl text-secondary"}>{sortedPlayers[2].Username}</span>
                        <span>WPM: <span className="text-bronze">{sortedPlayers[2].WPM}</span></span>
                        <span className="text-5xl italic font-bold font-mono text-bronze">#3</span>
                    </div>
                </div>
                }
            </div>
        </div>
    )
}
export default WinnerView;