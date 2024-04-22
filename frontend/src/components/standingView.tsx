
import { GameState } from "../interfaces/game"

interface standingsViewProps {
    gameState: GameState
    setGameState: React.Dispatch<React.SetStateAction<GameState>>
    username: string
}

const StandingsView: React.FC<standingsViewProps> = ({gameState, setGameState, username}) => {

    const baseUrl: string = import.meta.env.VITE_Backend_URL

    let playersleft = 0;
    const playersLeftCounter = gameState.Players.forEach((player) => {
        if (!player.IsDead){
            playersleft += 1;
        }
    })

    return (
        <div className="overflow-x-auto w-fit card bg-base-100">
            <div className="card-body">
                <div className="flex justify-center items-center">
                <div className="badge badge-ghost bold-text font-bold text-3xl italic">Next Round in: <span className="mx-2 text-4xl not-italic text-success">
                    <span className="countdown font-mono font-thin">
                        <span style={{"--value":gameState.countDown}}></span>
                    </span>
                </span>
                </div>

                </div>

                <div>
                    <h1 className="text font-mono text-2xl text-center">Players Left <span className="countdown font-mono text-success text-xl">
                    <span style={{"--value":playersleft}}></span>
                    </span></h1>
                </div>

                <table className="table">
                    {/* head */}
                    <thead>
                    <tr>
                        <th></th>
                        <th>Player</th>
                        <th>Fact</th>
                        <th>WPM Last Round</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* row 1 */}
                    {gameState.Players.map((Player, index) => (
                        <tr>
                            <th className="flex flex-row gap-4 justify-center items-center">
                                {index + 1}
                                <div className="avatar flex flex-col h-16 w-16 p-1">
                                    <div className={Player.IsDead ? "rounded-full ring ring-error": "rounded-full ring ring-success"}>
                                        <img src={`$${baseUrl}/public/images/${Player.Username}.png`} alt="no profile" />
                                    </div>
                                </div>
                            </th>
                            <td>
                                <span className={Player.Username == username ? "text-bold text-lg": "text-bold text-xl text-secondary"}>{Player.IsDead ? "💀 " + Player.Username : Player.Username}</span>
                            </td>
                            <td>{Player.IsDead ? "Is dead because they suck":"Is a stupid loser"}</td>
                            <td>{Player.lastRoundWPM}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            </div>
    )
}

export default StandingsView;