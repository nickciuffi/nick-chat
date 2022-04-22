import {useParams} from 'react-router-dom'
import Header from '../Components/Header'
import Message from '../Components/Message'
import {useState, useEffect, FormEvent} from 'react'
import {database, ref, onValue, push, child} from '../services/firebase'
import '../styles/chatRoom.scss'
import {useAuth} from '../hooks/useAuth'
 
type RoomParams = {
    id:string;
}

type MessageType = {
    key:number,
    content:string;
    author:string;
   
}



export default function ChatRoom(){

    const [messages, setMessages] = useState<MessageType[]>([])
    const {user} = useAuth()
    const [newMessage, setNewMessage] = useState("")
 
    const params = useParams<RoomParams>();
    const chatCode = params.id;

    useEffect(() =>{
        window.scrollTo(0, document.body.scrollHeight);
    })

    useEffect(() =>{
        const starCountRef = ref(database, `chats/${chatCode}/messages`);
        onValue(starCountRef, (snapshot) => {
            if(snapshot.exists()){
            var keyMessages = 0;
            const messagesFixed = Object.entries(snapshot.val()).map((value:any) =>{
                keyMessages++;
                return{
                    key:keyMessages,
                    content: value[1].content,
                    author: value[1].author,
                    }
                    
            });
            
            setMessages(messagesFixed)
            
            }
        })
    }, [])


    async function handleSendMessage(event:FormEvent){
        event.preventDefault()
        if(newMessage === "") return
        const dbRef = ref(database);
        const chatRoom = push(child(dbRef, `chats/${chatCode}/messages`), {
            content: newMessage,
            author:user?.id,
          })
          setNewMessage("");
    }

    return(
        <>
        <Header />
        <div className="chat">
            <div className="messages">
            {messages.map((message:MessageType) =>{
                return <Message key={message.key} content={message.content} author={message.author}/>
            })}
            </div>
            <form id="msg-sender" onSubmit={handleSendMessage} className="msg-sender">
                <input value={newMessage} onChange={event => setNewMessage(event.target.value)} type="text" />
                <button>Send</button>
            </form>
            </div>
        </>
    )
}