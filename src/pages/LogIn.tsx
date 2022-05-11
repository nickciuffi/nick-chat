import {useAuth} from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import '../styles/login.scss'
import Header from '../Components/Header'

export default function LogIn() {

    const {signInWithGoogle, user} = useAuth()
    const navigate = useNavigate(); 

    async function handleLogIn(){
      await signInWithGoogle();
      navigate("/")
    }

  return (
    <>
    <Header/>
    <div className="login">
        <h2>LogIn</h2>
        <button onClick={() => handleLogIn()}>LogIn with Google</button>

        
    </div>
    </>
  )
}
