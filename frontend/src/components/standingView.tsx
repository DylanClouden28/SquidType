
import { GameState, Player } from "../interfaces/game"

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
    let alivePlayers: Player[] = []
    let deadPlayers: Player[] = []
    gameState.Players.sort((a,b) =>{
        return Number(b.WPM) - Number(a.WPM)
    }).forEach(Player => {
        if(Player.IsDead){
            deadPlayers.push(Player)
        }
        else{
            alivePlayers.push(Player)
        }
    })

    return (
        <div className="overflow-x-auto w-fit card bg-base-100 ">
            <div className="card-body block max-h-[50rem] p-4">
                <div className="mb-4">
                    <div className="bold-text font-bold text-3xl italic text-center">Next Round in: <span className="mx-2 text-4xl not-italic text-success">
                        <span className="countdown font-mono font-thin">
                            <span style={{"--value":gameState.countDown}}></span>
                        </span>
                    </span>
                    </div>

                </div>

                <div className="flex flex-row justify-center ">
                    <div>
                        <div>
                            <h1 className="text font-mono text-2xl text-center">Players Alive <span className="countdown font-mono text-success text-xl">
                            <span style={{"--value":alivePlayers.length}}></span>
                            </span></h1>
                        </div>
                        <table className="table w-full">
                            {/* head */}
                            <thead className="sticky top-0 bg-base-100 z-10">
                            <tr>
                                <th></th>
                                <th>Player</th>
                                <th>Fact</th>
                                <th>WPM Last Round</th>
                            </tr>
                            </thead>
                            <tbody className="max-h-96">
                            {/* row 1 */}
                            {alivePlayers.map((Player, index) => (
                                <tr>
                                    <th className="flex flex-row gap-4 justify-center items-center">
                                        {index + 1}
                                        <div className="avatar flex flex-col h-16 w-16 p-1">
                                            <div className={Player.IsDead ? "rounded-full ring ring-error": "rounded-full ring ring-success"}>
                                                <img src={`${baseUrl}/public/images/${Player.Username}.png`} alt="no profile" />
                                            </div>
                                        </div>
                                    </th>
                                    <td>
                                        <span className={Player.Username == username ? "text-bold text-lg": "text-bold text-xl text-secondary"}>{Player.IsDead ? "💀 " + Player.Username : Player.Username}</span>
                                    </td>
                                    <td>{Player.IsDead ? "Is dead because they suck":"Is a stupid loser"}</td>
                                    <td>{Player.WPM}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                
                    
                    <div>
                        <div>
                            <h1 className="text font-mono text-2xl text-center">💀 Dead Players <span className="countdown font-mono text-error text-xl">
                            <span style={{"--value":deadPlayers.length}}></span>
                            </span></h1>
                        </div>
                        <table className="table w-full">
                            {/* head */}
                            <thead className="sticky top-0 bg-base-100 z-10">
                            <tr>
                                <th></th>
                                <th>Player</th>
                                <th>Fact</th>
                                <th>WPM Last Round</th>
                            </tr>
                            </thead>
                            <tbody className="max-h-96">
                            {/* row 1 */}
                            {deadPlayers.map((Player, index) => (
                                <tr>
                                    <th className="flex flex-row gap-4 justify-center items-center">
                                        {index + 1}
                                        <div className="avatar flex flex-col h-16 w-16 p-1">
                                            <div className={Player.IsDead ? "rounded-full ring ring-error": "rounded-full ring ring-success"}>
                                                <img src={`${baseUrl}/public/images/${Player.Username}.png`} alt="no profile" />
                                            </div>
                                        </div>
                                    </th>
                                    <td>
                                        <span className={Player.Username == username ? "text-bold text-lg": "text-bold text-xl text-secondary"}>{Player.IsDead ? "💀 " + Player.Username : Player.Username}</span>
                                    </td>
                                    <td>{Player.IsDead ? "Is dead because they suck":"Is a stupid loser"}</td>
                                    <td>{Player.WPM}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            </div>
    )
}

export default StandingsView;