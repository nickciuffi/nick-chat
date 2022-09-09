import {useAuth} from '../hooks/useAuth'
import {useEffect, useState, FormEvent} from 'react'
import { useNavigate, Link } from 'react-router-dom';
import Header from '../Components/Header'
import '../styles/home.scss'
import {firestore, collection, doc, getDoc, addDoc, query, where, onSnapshot, auth, signOut} from '../services/firebase'
import Swal from 'sweetalert2'
import Contact from '../Components/Contact'
import { getDocs, orderBy, setDoc } from 'firebase/firestore';
import {AiOutlineClose} from 'react-icons/ai'
import copy from 'copy-to-clipboard';

type chatType = {
  creatorId: string
}
type contactType = {
  hasMsgs:boolean,
  id:string,
  name: string,
  chatCode:string,
  image:string[] | string,
}

type contactInGroupType = {
  id:string,
  name: string,
  image:string,
}

type roomType = {
  hasMsgs:boolean,
  lastMsg:number,
  image:string,
  name:string,
  users:string[],
  
  usersInfo:{
    id:string,
    image:string,
    name:string,
  }[]
}

 
export default function Home() {


    const {signInWithGoogle, user, theme, setTheme} = useAuth();
    const navigate = useNavigate();
    const [newContact, setNewContact] = useState('');
    const [contacts, setContacts] = useState<contactType[]>([]);
    const [groupContacts, setGroupContacts] = useState<contactInGroupType[]>([])

    useEffect(() =>{
      if(user?.id === 'noUser') navigate("/login");
    }, [user])

    useEffect(() =>{
      if(user?.id === 'noUser' || user === undefined) return
     getContacts()
      
    }, [user])
    useEffect(() =>{
      
    }, [contacts])
 

    

    async function getContacts(){
      
      const q = query(collection(firestore, "rooms"), where(`users`, "array-contains", `${user?.id}`), orderBy("lastMsg", "desc"));
      const unsubscribe = onSnapshot(q, async(snapshot) => {
        
        const contactsFinal = await snapshot.docs.map((e, key) =>{
        
         var users = e.data().usersInfo;
         var otherUsers:any = []
          if(e.data().users.length<=2){
          otherUsers = users.find((name:any) => name.id !== user?.id)
          var otherImages = []
          for(const keyUser in users)
          if(users[keyUser].id !== user?.id){
           otherImages.push(users[keyUser].image)
          }
          return {
            hasMsgs:e.data().hasMsgs,
            id:key.toString() as string,
            name:otherUsers.name as string,
            image:otherImages as string[],
            chatCode:e.id as string,
          }
          }
          else{
             var otherImages = []
             for(const keyUser in users)
              if(users[keyUser].id !== user?.id){
               otherImages.push(users[keyUser].image)
              }
             return{
              hasMsgs:e.data().hasMsgs,
              id:key.toString() as string,
              name:e.data().name as string,
              image:[e.data().image] as string[],
              chatCode:e.id as string,
            }
          }

         

        })
       setContacts(contactsFinal)
        
      })
    }

    async function handleAddContactGroup(event: FormEvent){
      event.preventDefault()
      if(user?.id === "noUser" || user === undefined) return
      if(user?.id === newContact){
        Swal.fire({
          text:"You can`t add yourself",
          confirmButtonColor:theme
        }) 
        setNewContact("")
        return
      }
      if(groupContacts.some(cont=> cont.id === newContact)){
        Swal.fire({
          text:"You have already added this contact",
          confirmButtonColor:theme
        }) 
        setNewContact("")
        return
      }
      const usersRef = collection(firestore, "users");

      const q = query(usersRef, where("id", "==", newContact));
      const contactToAdd = await getDocs(q)
      if(!contactToAdd.empty){
        const cont = contactToAdd.docs[0].data();
        const newContactData = {
          id:cont.id,
          name:cont.name,
          image:cont.image
        }
          setGroupContacts([...groupContacts, newContactData])
          setNewContact("")
    }
    else{
      
        Swal.fire({
          text:"User not found",
          confirmButtonColor:theme,
        }) 
        setNewContact("")
      
    }
  }

  function handleDeleteGroupContact(id:string){
    const changeGroupContact = groupContacts.slice()
    var idToDelete = changeGroupContact.map((cont, key)=>{
      if(cont.id === id){
        return key as number
      }
    })
    changeGroupContact.splice(idToDelete as any, 1)
    setGroupContacts(changeGroupContact)
  }

  async function handleCreateGroup(){
    if(user?.id === "noUser" || user === undefined) return
    if(groupContacts.length<2){
      Swal.fire({
        title:"Not enough users",
        text:"You need to select at least two contacts to create a new group",
        confirmButtonColor:theme
      }) 
      return
    }
    const roomsRef = collection(firestore, "rooms");
    var groupIds:string[] = [] 
    groupContacts.map(cont => {
      groupIds.push(cont.id as string)
    })
    const roomData:roomType = {
      
      hasMsgs:false,
      lastMsg: + new Date(),
      name:"Grupo",
      image:"none-group",
      users:[
      ...groupIds,
      user?.id as string,
      ],
      usersInfo:[
      ...groupContacts,
      {
        id:user?.id as string,
        name:user?.name as string,
        image:user?.avatar as string,
      }]
    }
    var idsSeparated = ""
    groupIds.map(id=>{
      idsSeparated+=`${id}-`
    })
    
  await setDoc(doc(roomsRef, `group-${idsSeparated}${user?.id}`), roomData)
  await handleAddGroupInvisible()
  }
    
    async function handleAddContact(event: FormEvent){
      event.preventDefault()
      if(user?.id === "noUser" || user === undefined) return
      if(contacts.some(data => data.id === newContact)){
        Swal.fire({
          title:"Error",
          text:"You already have this contact",
          confirmButtonColor:theme
        }) 
        return
      }
      if(user?.id === newContact){
        Swal.fire({
          text:"You can`t add yourself",
          confirmButtonColor:theme
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
          hasMsgs:false,
          id:cont.id,
          name:cont.name,
          chatCode:`${cont.id}-${user?.id}`,
          image:[cont.image],
        }
        await addRoomFirestore(newContactData)
        setContacts([...contacts, newContactData])
        setNewContact("")
        handleAddContactInvisible();
      }
      else{
        Swal.fire({
          text:"User not found",
          confirmButtonColor:theme,
        }) 
        setNewContact("")
      }

    }
    async function addRoomFirestore(data:contactType){
      const roomsRef = collection(firestore, "rooms");
      
      const roomData:roomType = {
        hasMsgs:false,
        lastMsg: + new Date(),
        name:data.name,
        image:"none",
        users:[
        data.id,
        user?.id as string,
        ],
        usersInfo:[{
          id:data.id as string,
          name:data.name,
          image:data.image as string,
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
      const button = document.querySelectorAll(".add-btn")
      button.forEach((btn:any) => btn.classList.add("invisible"))
      const addContact = document.querySelector(".add-contact")
      addContact?.classList.remove("invisible")

    }
    function handleAddContactInvisible(){
      const button = document.querySelectorAll(".add-btn")
      button.forEach((btn:any) => btn.classList.remove("invisible"))
      const addContact = document.querySelector(".add-contact")
      addContact?.classList.add("invisible")
      setNewContact("")
    }
    function handleAddGroupVisible(){
      const button = document.querySelectorAll(".add-btn")
      button.forEach((btn:any) => btn.classList.add("invisible"))
      const addContact = document.querySelector(".add-group")
      addContact?.classList.remove("invisible")

    }
    function handleAddGroupInvisible(){
      const button = document.querySelectorAll(".add-btn")
      button.forEach((btn:any) => btn.classList.remove("invisible"))
      const addContact = document.querySelector(".add-group")
      addContact?.classList.add("invisible")
      setGroupContacts([])
      setNewContact("")
    }

    async function handleLogOut(){
      await signOut(auth).then(() => {
        navigate("/login")
      }).catch((error:any) => {
        console.log(error)
      });
    }

    function handleCopyId(){
      handleDropdown()
      copy(`${user?.id}`)
      Swal.fire({
        title:"Id copied",
        text:"You can send it to your friends and have amazing chats with them",
        confirmButtonColor:theme,
      }) 
    }
    function handleDropdown(){
      const drop = document.querySelector(".drop-header");
      if(drop?.classList.contains("visible")){
        drop.classList.remove("visible");
        
      }
      else{
      drop?.classList.add("visible")
      
      }
}
  
    return(
        <div className="home"> 
        <Header avatar={[user?.avatar as string]} >
        <p className="logged">
            {user?.name}    
            </p>
            <p>Theme <input type="color" onChange={(value) => {
              setTheme(value.target.value)
              localStorage.setItem('theme', value.target.value)
            }} value={theme}/></p>
            <a onClick={() => handleCopyId()}>Copy id</a>
            <a className="log-out" onClick={() =>handleLogOut()}>Log Out</a>
        </Header>
       <div className="home-content">
       
        <form className="add-contact add-thing invisible" onSubmit={handleAddContact}>
          <div className="header-add-contact">
            <a onClick={() => handleAddContactInvisible()}>
          <AiOutlineClose />
          </a>
          <p>Add a contact</p>
          </div>
        <input value={newContact || ''} onChange={event => setNewContact(event.target.value)}type="text" placeholder="id of a profile"/>
        <button>Add profile</button>
        </form>
        <div className="add-group add-thing invisible">
        <form onSubmit={handleAddContactGroup}>
          <div className="header-add-contact">
            <a onClick={() => handleAddGroupInvisible()}>
          <AiOutlineClose />
          </a>
          <p>Add a group</p>
          </div>
        <input value={newContact || ''} onChange={event => setNewContact(event.target.value)}type="text" placeholder="id of a profile"/>
        <button>Add profile</button>
        </form>
        <div className="group-contacts">
        {groupContacts.map((contact, key) =>{
          return <div key={key}><a onClick={() =>{handleDeleteGroupContact(contact.id)}}><AiOutlineClose /></a><div className="contact-group"><img src={contact.image} /><p>{contact.name}</p></div></div>
        })}
        </div>
        <button className="create" onClick={() =>{handleCreateGroup()}}>Create</button>
        </div>

        <div className="buttons-add">
        <button onClick={() => handleAddContactVisible()} className="add-btn contact-btn">Add Contact</button>
        <button onClick={() => handleAddGroupVisible()} className="add-btn group-btn">Add Group</button>
        </div>


        <div className="contacts">
          <p>Contacts</p>
      <>
      {
      contacts?
      contacts.map((contact:contactType) =>{
       const firstPart = contact.chatCode.split("-")[0];
       var isGroup = false
       if(firstPart === "group"){
        isGroup = true
       }
        return(
        <Contact isGroup={isGroup} hasMsgs={contact.hasMsgs} key={contact.id} image={contact.image} name={contact.name} code={contact.chatCode}/>)
      })
      :<p>You have no contacts.</p>
    }
</>
      </div>
        </div>
        </div>
        
    )
  }