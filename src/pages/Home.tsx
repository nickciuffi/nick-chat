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
import {AiOutlineClose} from 'react-icons/ai'

type chatType = {
  creatorId: string
}
type contactType = {
  id:string,
  name: string,
  chatCode:string,
  image:string,
}

type roomType = {
  users:string[],
  usersInfo:{
    id:string,
    image:string,
    name:string,
  }[]
}

 
export default function Home() {

    const MySwal = withReactContent(Swal)

    const {signInWithGoogle, user} = useAuth();
    const navigate = useNavigate();
    const [newContact, setNewContact] = useState('');
    const [contacts, setContacts] = useState<contactType[]>([]);

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
        const otherUser = e.data().usersInfo.find((name:any) => name.id !== user?.id)
         
       // const {otherImage, otherName} = await getInfoUser(otherId)
       
          return{
            id:otherUser.id as string,
            name:otherUser.name as string,
            image:otherUser.image as string,
            chatCode:e.id as string,
          }

        })
        
        setContacts(contactsFinal)
        
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
      if(user?.id === "noUser" || user === undefined) return
      if(contacts.some(data => data.id === newContact)){
        Swal.fire({
          text:"You already have this contact",
          confirmButtonColor:"#4dc45c"
        }) 
        return
      }
      if(user?.id === newContact){
        Swal.fire({
          text:"You can`t add yourself",
          confirmButtonColor:"#4dc45c"
        }) 
        setNewContact("")
        return
      }
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
        await addRoomFirestore(newContactData)
        setContacts([...contacts, newContactData])
      }
      else{
        Swal.fire({
          text:"User not found",
          confirmButtonColor:"#4dc45c"
        }) 
        setNewContact("")
      }

      
     
    }
    async function addRoomFirestore(data:contactType){
      const roomsRef = collection(firestore, "rooms");
      const roomData:roomType = {
        users:[
        data.id,
        user?.id as string,
        ],
        usersInfo:[{
          id:data.id as string,
          name:data.name,
          image:data.image,
        },
        {
          id:user?.id as string,
          name:user?.name as string,
          image:user?.avatar as string,
        }]
      }

      await setDoc(doc(roomsRef, `${data.chatCode}`), roomData)
    }
   
    function handleAddContactVisible(){
      const button = document.querySelector(".add-contact-btn")
      button?.classList.add("invisible")
      const addContact = document.querySelector(".add-contact")
      addContact?.classList.remove("invisible")

    }
    function handleAddContactInvisible(){
      const button = document.querySelector(".add-contact-btn")
      button?.classList.remove("invisible")
      const addContact = document.querySelector(".add-contact")
      addContact?.classList.add("invisible")

    }
  
    return(
        <div className="home"> 
        <Header />
       <div className="home-content">
       
        <form className="add-contact invisible" onSubmit={handleAddContact}>
          <div className="header-add-contact">
            <a onClick={() => handleAddContactInvisible()}>
          <AiOutlineClose />
          </a>
          <p>Add a contact</p>
          </div>
        <input value={newContact || ''} onChange={event => setNewContact(event.target.value)}type="text" placeholder="id of a profile"/>
        <button>Add profile</button>
        </form>
        <button onClick={() => handleAddContactVisible()} className="add-contact-btn">Add Contact</button>
        <div className="contacts">
          <p>Contacts</p>
      <>
      {
      contacts?
      contacts.map((contact:contactType) =>{
       
        return(
        <Contact key={contact.id} image={contact.image} name={contact.name} code={contact.chatCode}/>)
      })
      :<p>You have no contacts.</p>
    }
</>
      </div>
        </div>
        </div>
        
    )
}