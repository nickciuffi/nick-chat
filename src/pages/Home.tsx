import {useAuth} from '../hooks/useAuth'
import {useEffect, useState, FormEvent} from 'react'
import { useNavigate, Link } from 'react-router-dom';
import Header from '../Components/Header'
import '../styles/home.scss'
import {firestore, collection, doc, getDoc, addDoc, query, where, onSnapshot} from '../services/firebase'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Contact from '../Components/Contact'
import { getDocs } from 'firebase/firestore';

type chatType = {
  creatorId: string
}
type contactType = {
  id:number,
  name: string,
  chatCode:string,
}

 
export default function Home() {

    const MySwal = withReactContent(Swal)

    const {test, signInWithGoogle, user} = useAuth();
    const navigate = useNavigate();
    const [joinCode, setJoinCode] = useState('');
    const [contacts, setContacts] = useState<contactType[]>([]);

    useEffect(() =>{
      if(user?.id === 'noUser') navigate("/login");
    }, [user])

    useEffect(() =>{
     getContacts()

    }, [])

    async function getContacts(){
      
      const q = query(collection(firestore, "rooms"), where("users", "array-contains", "user1"));
      const unsubscribe = onSnapshot(q, async(snapshot) => {
      const contactsFinal = await snapshot.docs.map((e) =>{
        const otherName = e.data().users.find((name:string) => name !== "user1")
        
         let contactNum = 0;
          return{
            id:contactNum,
            name:otherName,
            chatCode:e.id,
          }

        })
        setContacts(contactsFinal)
      })
    }

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
          <p>Contacts</p>
      <>
      {
      contacts?
      contacts.map((contact:contactType) =>{
       
        return(
        <Contact key={contact.id} name={contact.name} code={contact.chatCode}/>)
      })
      :<p>You have no contacts.</p>
    }
</>
      </div>
        </div>
        </div>
        
    )
}