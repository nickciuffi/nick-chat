import {useAuth} from '../hooks/useAuth'
import {useEffect, useState, FormEvent} from 'react'
import { useNavigate, Link } from 'react-router-dom';
import Header from '../Components/Header'
import '../styles/home.scss'
import {database, ref, set, get, child, push, onValue} from '../services/firebase'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

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

    async function handleCreateChat(){

        await set(ref(database, `chatsToJoin/${user?.id}`), user?.id);
        navigator.clipboard.writeText(`${user?.id}`)
      MySwal.fire({
        title: 'Chat room created!',
        icon: 'success',
        html:
        `<p>Your room code has been copied!</p>`
      })
      const chatsToJoinRef = ref(database, `chatsToJoin/${user?.id}`);
      onValue(chatsToJoinRef, (value) => {
        console.log(value.val())
        if(value.val() !== user?.id){
          navigate(`chat/${value.val()}`);
        }
      })
 
    }


    async function handleJoinChat(event: FormEvent){
      event.preventDefault()
      const userCode = user?.id;
      const dbRef = ref(database);
      await get(child(dbRef, `chatsToJoin`)).then((snapshot) => {
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
      })
    }
   
    
  
    return(
        <div className="home"> 
        <Header />
        <h2>Whatsapp 2</h2>
        <div className="home-content">
       
        <button onClick={() => handleCreateChat()}>Create a Chat</button>
        <p className="divider">OR</p>
        <form className="enter-chat" onSubmit={handleJoinChat}>
        <input onChange={event => setJoinCode(event.target.value)}type="text" placeholder="chat room code"/>
        <button>Enter a chat</button>
        </form>
        </div>
        </div>
        
    )
}