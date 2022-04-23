import {useParams, useNavigate} from 'react-router-dom'
import Header from '../Components/Header'
import Message from '../Components/Message'
import {useState, useEffect, FormEvent, EventHandler} from 'react'
import {database, ref, onValue, push, child, storage, refStorage, uploadBytes} from '../services/firebase'
import '../styles/chatRoom.scss'
import {useAuth} from '../hooks/useAuth'
import {IoMdSend, IoMdPhotos} from 'react-icons/io'


type RoomParams = {
    id:string;
}

type MessageType = {
    id:string,
    key:number,
    content:string;
    author:string;
    hasImage:boolean;
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
        const starCountRef = ref(database, `chats/${chatCode}/messages`);
        onValue(starCountRef, (snapshot) => {
            if(snapshot.exists()){
            var keyMessages = 0;
            const messagesFixed = Object.entries(snapshot.val()).map((value:any) =>{
                keyMessages++;
                return{
                    id:value[0],
                    key:keyMessages,
                    content: value[1].content,
                    author: value[1].author,
                    hasImage:value[1].hasImage,
                    }
                    
            });
            
            setMessages(messagesFixed)
            
            }
        })
    }, [])


    async function handleSendMessage(event:FormEvent){
        event.preventDefault()
        const hasImg = (newImage !== undefined)
        if(newMessage === "" && !hasImg) return
       
        const dbRef = ref(database);
        const chatRoom = push(child(dbRef, `chats/${chatCode}/messages`), {
            content: newMessage,
            author:user?.id,
            hasImage:hasImg,
          })
          if(hasImg){
            sendImage(chatRoom.key);

        }
          setNewMessage("");
    }

    async function sendImage(key:any){
        const imageRef = refStorage(storage, `images/${chatCode}/${key}`)

        
        uploadBytes(imageRef, newImage as File).then((snapshot) => {
            console.log('Uploaded a blob or file!' + snapshot);
          });
          setNewImage(undefined);

    }



    return(
        <>
        <Header />
        <div className="chat">
            <div className="messages">
            {messages.map((message:MessageType) =>{
               return <Message chatCode={chatCode as string} id={message.id} hasImage={message.hasImage} key={message.key} content={message.content} author={message.author}/>
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