import {useAuth} from '../hooks/useAuth'
import {useEffect, useState, FormEvent} from 'react'
import { useNavigate, Link } from 'react-router-dom';
import Header from '../Components/Header'
import '../styles/home.scss'
import {firestore, collection, addDoc} from '../services/firebase'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Contact from '../Components/Contact'

type chatType = {
  creatorId: string
}

 
export default function Home() {

    const MySwal = withReactContent(Swal)

    const {test, signInWithGoogle, user} = useAuth();
    const navigate = useNavigate();
    const [joinCode, setJoinCode] = useState('');

    useEffect(() =>{
      if(user?.id === 'noUser') navigate("/login");
    }, [user])

    

    async function handleJoinChat(event: FormEvent){
      event.preventDefault()
      const userCode = user?.id;
      
     /* await get(child(dbRef, `chatsToJoin`)).then((snapshot) => {
        if(snapshot.exists()) {
          const values = Object.entries(snapshot.val())

          if(joinCode === user?.id){
            MySwal.fire("You can`t enter your own chat")
            return;
          }
          if(values.some(value =>value[1] == joinCode)){
            //if the room exists
            
           const chatRoom = push(child(dbRef, `chats`), {
              users: [userCode, joinCode]
            })
            set(ref(database, `chatsToJoin/${joinCode}`), chatRoom.key);
            navigate(`chat/${chatRoom.key}`)
          }
          else{
            MySwal.fire("This room does not exist")
          }
        }
      })*/
    }
   
    
  
    return(
        <div className="home"> 
        <Header />
       <div className="home-content">
       
        <form className="enter-chat" >
        <input onChange={event => setJoinCode(event.target.value)}type="text" placeholder="Enter an id profile"/>
        <button>Add profile</button>
        </form>
        <div className="contacts">
      <Contact />
      <Contact />
      <Contact />

      </div>
        </div>
        </div>
        
    )
}