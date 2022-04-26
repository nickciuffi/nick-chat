import {useAuth} from '../hooks/useAuth'
import {useEffect, useState, FormEvent} from 'react'
import { useNavigate, Link } from 'react-router-dom';
import Header from '../Components/Header'
import '../styles/home.scss'
import {firestore, collection, doc, getDoc, addDoc, query, where, onSnapshot} from '../services/firebase'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Contact from '../Components/Contact'
import { getDocs, setDoc } from 'firebase/firestore';

type chatType = {
  creatorId: string
}
type contactType = {
  id:string,
  name: string,
  chatCode:string,
  image:string,
}

 
export default function Home() {

    const MySwal = withReactContent(Swal)

    const {signInWithGoogle, user} = useAuth();
    const navigate = useNavigate();
    const [newContact, setNewContact] = useState('');
    const [contacts, setContacts] = useState<any>([]);

    useEffect(() =>{
      if(user?.id === 'noUser') navigate("/login");
    }, [user])

    useEffect(() =>{
      if(user?.id === 'noUser' || user === undefined) return
     getContacts()
      
    }, [user])

    async function getContacts(){
      
      const q = query(collection(firestore, "rooms"), where(`users`, "array-contains", `${user?.id}`));
      const unsubscribe = onSnapshot(q, async(snapshot) => {
        const contactsFinal = await snapshot.docs.map((e) =>{
        const otherId = e.data().usersInfo.find(async(name:string) => name !== user?.id)

       
       // const {otherImage, otherName} = await getInfoUser(otherId)
       
          return{
            id:otherId.id as string,
            name:otherId.name as string,
            image:otherId.image as string,
            chatCode:e.id as string,
          }

        })
        
        setContacts(contactsFinal)
        console.log(await contactsFinal)

        

      })
    }

    async function getInfoUser(id:string){
      const q = query(collection(firestore, "users"), where("id", "==", `${id}`))
      
      const userInfo = await getDocs(q)
      
      const otherName = userInfo.docs[0].data().name;
      const otherImage = userInfo.docs[0].data().image;
      return ({otherName, otherImage})
    }

    async function handleAddContact(event: FormEvent){
      event.preventDefault()
      if(user?.id === "noUser" || user === undefined || newContact === user?.id) return
      const userCode = user?.id;
      const usersRef = collection(firestore, "users");

      const q = query(usersRef, where("id", "==", newContact));
      const contactToAdd = await getDocs(q)
      if(!contactToAdd.empty){
        const cont = contactToAdd.docs[0].data();
        const newContactData = {
          id:cont.id,
          name:cont.name,
          chatCode:`${cont.id}-${user?.id}`,
          image:cont.image,
        }
        //setContacts(currentContacts => [...currentContacts, contactToAdd.docs[0].data()])
        console.log([...contacts, contactToAdd.docs[0].data()])
      }
      else{
        console.log("User not found")
      }

      
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
       
        <form className="enter-chat" onSubmit={handleAddContact}>
        <input onChange={event => setNewContact(event.target.value)}type="text" placeholder="Enter an id profile"/>
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