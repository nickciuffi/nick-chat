import {useParams, useNavigate} from 'react-router-dom'
import Header from '../Components/Header'
import Message from '../Components/Message'
import {useState, useEffect, FormEvent, EventHandler} from 'react'
import {firestore, getDoc, addDoc, doc, collection, orderBy, query, onSnapshot, storage, refStorage, uploadBytes} from '../services/firebase'
import '../styles/chatRoom.scss'
import {useAuth} from '../hooks/useAuth'
import {IoMdSend, IoMdPhotos} from 'react-icons/io'
import { getDocs, setDoc, where } from 'firebase/firestore'


type RoomParams = {
    id:string;
}

type MessageType = {
    viewed:boolean,
    id:string,
    key:number,
    content:string;
    author:string;
    hasImage:boolean;
    time:number,
}

type roomType = {
    hasMsgs:boolean,
    lastMsg:number,
    users:string[],
    usersInfo:{
      id:string,
      image:string,
      name:string,
    }[]
}

export default function ChatRoom(){

    const [messages, setMessages] = useState<MessageType[]>([])
    const {user} = useAuth()
    const [newMessage, setNewMessage] = useState("")
    const [newImage, setNewImage] = useState<File | null>();
 
    const params = useParams<RoomParams>();
    const chatCode = params.id;

    const navigate = useNavigate();

    useEffect(() =>{
        window.scrollTo(0, document.body.scrollHeight);
    })
    useEffect(() =>{
        if(user?.id === 'noUser') navigate("/login");
      }, [user])

    useEffect(() =>{
             getMessages()
    }, [])

    async function setRoomToViewed(){
        const docRef = doc(firestore, "rooms", chatCode as string)
        const docData = await getDoc(docRef)
        const roomData:roomType = {
            lastMsg: docData.data()?.lastMsg,
            users:docData.data()?.users,
            usersInfo:docData.data()?.usersInfo,
            hasMsgs:false,
        }
        await setDoc(docRef, roomData)
    }

    async function setMessagesToViewed(){
        if(user?.id === 'noUser' || user === undefined) {
            return
        }
        await setRoomToViewed();
        const colRef = collection(firestore, "rooms", chatCode as string, "messages");
        const q = query(colRef, where("author", "!=", `${user?.id}`), where("viewed", "==", false))
        const mesgs = await getDocs(q)
       mesgs.docs.forEach(async(msg) =>{
            await setDoc(doc(firestore, "rooms", chatCode as string, "messages", `${msg.id}`), {
                content: msg.data().content,
                author: msg.data().author,
                hasImage: msg.data().hasImage,
                time:msg.data().time,
                viewed:true,
            })
        })
    }



    async function getMessages(){
        const colRef = collection(firestore, "rooms", chatCode as string, "messages");
        const unsub = onSnapshot(colRef, async() => {
        if(window.location.pathname === `/chat/${chatCode}`){
        setMessagesToViewed();
        }
        
        const colRefOrdered = query(colRef, orderBy("time"))
        const docSnap = await getDocs(colRefOrdered);
        let keyMessages = 0
        const messagesToAdd = await docSnap.docs.map((doc) =>{
            keyMessages++;
            return{
                viewed:doc.data().viewed,
                id:doc.id,
                key:keyMessages,
                content: doc.data().content,
                author: doc.data().author,
                hasImage:doc.data().hasImage,
                time: doc.data().time,
                hasMsgs:doc.data().hasMsgs,
                }
                   
        })
        setMessages(messagesToAdd)
          })

    }
    

    async function handleSendMessage(event:FormEvent){
        event.preventDefault()
        const hasImg = (newImage !== undefined)
        if(newMessage === "" && !hasImg) return
        
        const colRef = collection(firestore, "rooms", chatCode as string, "messages");
        const docRef = await addDoc(colRef, {
            viewed:false,
            content: newMessage,
            author:user?.id,
            hasImage:hasImg,
            time: Date.now(),
          });
          if(hasImg){
            sendImage(docRef.id);

        }
          setNewMessage("");
          setTimeAndHasMsgsRoom();
    }

    async function setTimeAndHasMsgsRoom(){
        const docRef = doc(firestore, "rooms", chatCode as string)
        const docData = await getDoc(docRef)
        const roomData:roomType = {
            lastMsg: Date.now(),
            users:docData.data()?.users,
            usersInfo:docData.data()?.usersInfo,
            hasMsgs:true,
        }
        setDoc(docRef, roomData)
    }

   
    async function sendImage(key:any){
        const imageRef = refStorage(storage, `images/${chatCode}/${key}`)

        
        await uploadBytes(imageRef, newImage as File).then((snapshot) => {
            });
          setNewImage(undefined);

    }



    return(
        <>
        <Header />
        <div className="chat">
            <div className="messages">
            {messages.map((message:MessageType) =>{
               return <Message time={message.time} viewed={message.viewed} chatCode={chatCode as string} id={message.id} hasImage={message.hasImage} key={message.key} content={message.content} author={message.author}/>
            })}
            </div>
            <form id="msg-sender" onSubmit={handleSendMessage} className="msg-sender">
                <input value={newMessage} onChange={event => setNewMessage(event.target.value)} type="text" />
                <label className={newImage !== undefined ?"filed":""} htmlFor="file"><IoMdPhotos /></label>
                <input id="file" type="file" accept="image/*" onChange={(event:any) => {
                    setNewImage(event.target.files[0])
                }}/>
                <button><IoMdSend /></button>
            </form>
            </div>
        </>
    )
}