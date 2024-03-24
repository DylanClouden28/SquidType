import { useState} from 'react'
import { useNavigate } from 'react-router-dom';


function App() {
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });

  const [signUpForm, setSignUpForm] = useState({
    username: '',
    password1: '',
    password2: '',
  });

  const [isAlertLogin, setAlertLogin] = useState("");
  const [isAlertSignup, setAlertSignup] = useState("");
  const nav = useNavigate()

  const closeAlert = (func: React.Dispatch<React.SetStateAction<string>>) => {
    func("");
  }

  const signUpScroll = () => {
    const Element = document.getElementById('signup')
    if (Element === undefined || Element === null){
      return
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
    Element.scrollIntoView({behavior: "smooth"})
  }

  const tryLogin = async () => {
    try{
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        body: JSON.stringify({
          username: loginForm.username,
          password: loginForm.password 
        })
      })
      if (!response.ok){
        const {err} = await response.json()
        setAlertLogin(err || 'Error with logging in')
      }
      nav('/home')
      
    } catch (error){
      setAlertLogin("Error with logging in asdasd")
    }
  }

  const tryRegister = async () => {
    try{
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        body: JSON.stringify({
          username: signUpForm.username,
          password1: signUpForm.password1,
          password2: signUpForm.password2,
        }),
        mode: "cors"
      })
      if (!response.ok){
        const {err} = await response.json()
        setAlertSignup(err || 'Error with creating account')
      }


    } catch (error){
      setAlertSignup("Error with creating account")
    }
  }

  return (
    <div data-theme="night">
    <div className="hero min-h-screen bg-base-200 justify-center">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold text-primary">Login now!</h1>
          <p className='text-3xl font-bold'>Don't have account   <button onClick={signUpScroll} className='btn btn-lg btn-outline btn-accent text-5xl font-bold italic '>Sign Up!</button></p>
        </div>
        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <div className="card-body">
            {isAlertLogin.length !== 0 && 
            <div role="alert" className="alert alert-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>{isAlertLogin}</span>
              <div>
              <button onClick={() => {closeAlert(setAlertLogin)}} className="btn btn-ghost btn-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            </div>
            }

            <div className="form-control">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input onChange={e => setLoginForm({username: e.target.value, password: loginForm.password})} value={loginForm.username} type="username" placeholder="username" className="input input-bordered" required />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input onChange={e => setLoginForm({username: loginForm.username, password: e.target.value})} value={loginForm.password} type="password" placeholder="password" className="input input-bordered" required />
            </div>
            <div className="form-control mt-6">
              <button onClick={tryLogin} className="btn btn-primary">Login</button>
            </div>
          </div>
        </div>
    </div>
  </div>

    <div className='h-screen' id='signup'>
    <div className="hero min-h-screen justify-center bg-base-100">
      <div className="hero-content flex-col lg:flex-row">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold text-secondary">Sign Up</h1>
          <p className='text-3xl font-bold'>Please sign up with the form</p>
        </div>
        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <div className="card-body">
          {isAlertSignup.length !== 0 && 
            <div role="alert" className="alert alert-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>{isAlertSignup}</span>
              <div>
              <button onClick={() => {closeAlert(setAlertSignup)}} className="btn btn-ghost btn-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            </div>
            }
          <div className="form-control">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input onChange={e => setSignUpForm({username: e.target.value, password1: signUpForm.password1, password2: signUpForm.password2})} value={signUpForm.username} type="username" placeholder="username" className="input input-bordered" required />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Choose Password</span>
              </label>
              <input onChange={e => setSignUpForm({username: signUpForm.username, password1: e.target.value, password2: signUpForm.password2})} value={signUpForm.password1} type="password" placeholder="password" className="input input-bordered" required />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirm Password</span>
              </label>
              <input onChange={e => setSignUpForm({username: signUpForm.username, password1: signUpForm.password1, password2: e.target.value})} value={signUpForm.password2} type="password" placeholder="password" className="input input-bordered" required />
            </div>
            <div className="form-control mt-6">
              <button onClick={tryRegister} className="btn btn-primary">Login</button>
            </div>
          </div>
        </div>
    </div>
    </div>
  </div>
  </div>
  )
}

export default App
