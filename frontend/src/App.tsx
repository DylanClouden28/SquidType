import { useState, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });

  const [signUpForm, setSignUpForm] = useState({
    username: '',
    password: '',
  });

  // const handleLoginFormChange = (e) => {
  //   const 

  // }

  const signupRef = useRef();

  const signUpScroll = () => {
    const current = signupRef.current
    if (current === undefined){
      return
    }
    current.scrollIntoView({behavior: "smooth"})
  }

  return (
    <>
    <div className="hero min-h-screen bg-base-200 justify-center">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Login now!</h1>
          <p className="py-6">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.</p>
          <p className='text-3xl font-bold'>Don't have account   <button onClick={signUpScroll} className='text-accent text-5xl px-2 font-bold italic hover:text-accent'>Sign Up!</button></p>
        </div>
        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <form className="card-body">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input type="email" placeholder="email" className="input input-bordered" required />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input type="password" placeholder="password" className="input input-bordered" required />
            </div>
            <div className="form-control mt-6">
              <button className="btn btn-primary">Login</button>
            </div>
          </form>
        </div>
    </div>
  </div>

    <div className='h-screen' id='signup' ref={signupRef}>
    <div className="hero min-h-screen justify-center bg-base-100">
      <div className="hero-content flex-col lg:flex-row">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold text-secondary">Sign Up</h1>
          <p className='text-3xl font-bold'>Please sign up with the form</p>
        </div>
        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <form className="card-body">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input type="email" placeholder="email" className="input input-bordered" required />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input type="password" placeholder="password" className="input input-bordered" required />
            </div>
            <div className="form-control mt-6">
              <button className="btn btn-primary">Login</button>
            </div>
          </form>
        </div>
    </div>
    </div>
  </div>
  </>
  )
}

export default App
