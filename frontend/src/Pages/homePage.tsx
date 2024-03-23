import sendIcon from '../assets/send-svgrepo-com.svg'


function home(){


    return(
        <div className="p-4 bg-base-200 min-h-screen" data-theme="night">
            <div className="navbar bg-base-100 rounded-box shadow-xl mb-40 p-4">
            <div className="flex-1">
                <a className="btn btn-ghost text-xl">Home Page</a>
            </div>
            <div className="navbar-end">
                <div className="dropdown dropdown-bottom dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                </div>
                <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                    <li><a>Signout</a></li>
                </ul>
                </div>
            </div>
            </div>

            <div className="grid justify-items-center">
                <div className="card w-3/5 shadow-xl max-w-3xl">
                    <div className="chatBox p-2 h-96 overflow-auto">
                        <div className=''>
                            <div className="chat chat-start">
                                <div className="chat-header">
                                    Obi-Wan Kenobi
                                </div>
                                <div className="chat-bubble">You were the Chosen One!</div>
                            </div>

                            <div className="chat chat-end">
                                <div className="chat-header mr-2">
                                    Anakin
                                </div>
                                <div className="chat-bubble">I hate you!</div>
                            </div>
                            <div className="chat chat-start">
                                <div className="chat-header">
                                    Obi-Wan Kenobi
                                </div>
                                <div className="chat-bubble">You were the Chosen One!</div>
                            </div>

                            <div className="chat chat-end">
                                <div className="chat-header mr-2">
                                    Anakin
                                </div>
                                <div className="chat-bubble">I hate you!</div>
                            </div>
                            <div className="chat chat-start">
                                <div className="chat-header">
                                    Obi-Wan Kenobi
                                </div>
                                <div className="chat-bubble">You were the Chosen One!</div>
                            </div>

                            <div className="chat chat-end">
                                <div className="chat-header mr-2">
                                    Anakin
                                </div>
                                <div className="chat-bubble">I hate you!</div>
                            </div>
                            <div className="chat chat-start">
                                <div className="chat-header">
                                    Obi-Wan Kenobi
                                </div>
                                <div className="chat-bubble">You were the Chosen One!</div>
                            </div>

                            <div className="chat chat-end">
                                <div className="chat-header mr-2">
                                    Anakin
                                </div>
                                <div className="chat-bubble">I hate you!</div>
                            </div>

                            <div className="chat chat-end">
                                <div className="chat-header mr-2">
                                    Anakin
                                </div>
                                <div className="chat-bubble">I hate you!</div>
                            </div>

                            <div className="chat chat-end">
                                <div className="chat-header mr-2">
                                    Anakin
                                </div>
                                <div className="chat-bubble">I hate you!</div>
                            </div>

                            <div className="chat chat-end">
                                <div className="chat-header mr-2">
                                    Anakin
                                </div>
                                <div className="chat-bubble">I hate you!</div>
                            </div>

                            <div className="chat chat-end">
                                <div className="chat-header mr-2">
                                    Anakin
                                </div>
                                <div className="chat-bubble">I hate you!</div>
                            </div>

                            <div className="chat chat-end">
                                <div className="chat-header mr-2">
                                    Anakin
                                </div>
                                <div className="chat-bubble">I hate you!</div>
                            </div>

                            <div className="chat chat-end">
                                <div className="chat-header mr-2">
                                    Anakin
                                </div>
                                <div className="chat-bubble">I hate you!</div>
                            </div>

                            <div className="chat chat-end">
                                <div className="chat-header mr-2">
                                    Anakin
                                </div>
                                <div className="chat-bubble">I hate you!</div>
                            </div>

                            <div className="chat chat-end">
                                <div className="chat-header mr-2">
                                    Anakin
                                </div>
                                <div className="chat-bubble">I hate you!</div>
                            </div>

                            <div className="chat chat-end">
                                <div className="chat-header mr-2">
                                    Anakin
                                </div>
                                <div className="chat-bubble">I hate you!</div>
                            </div>

                            <div className="chat chat-end">
                                <div className="chat-header mr-2">
                                    Anakin
                                </div>
                                <div className="chat-bubble">I hate you!</div>
                            </div>

                            <div className="chat chat-end">
                                <div className="chat-header mr-2">
                                    Anakin
                                </div>
                                <div className="chat-bubble">I hate you!</div>
                            </div>

                            <div className="chat chat-end">
                                <div className="chat-header mr-2">
                                    Anakin
                                </div>
                                <div className="chat-bubble">I hate you!</div>
                            </div>

                            <div className="chat chat-end">
                                <div className="chat-header mr-2">
                                    Anakin
                                </div>
                                <div className="chat-bubble">I hate you!</div>
                            </div>
                        </div>
                    </div>




                    <div className="card-body p-2">
                        <div className="flex">
                            <input className="input input-bordered flex-grow mx-2" placeholder="Type here" type="text" />
                            <img className="btn btn-accent p-2" src={sendIcon}></img>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
    )
}
export default home;