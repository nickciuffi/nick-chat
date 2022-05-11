import {useParams, useNavigate} from 'react-router-dom'
import Header from '../Components/Header'
import Message from '../Components/Message'
import {useState, useEffect, FormEvent, EventHandler} from 'react'
import {firestore, getDoc, addDoc, doc, collection, orderBy, query, onSnapshot, storage, refStorage, uploadBytes} from '../services/firebase'
import '../styles/chatRoom.scss'
import {useAuth} from '../hooks/useAuth'
import {IoMdSend, IoMdPhotos} from 'react-icons/io'
import { deleteDoc, getDocs, setDoc, where } from 'firebase/firestore'
import Swal from 'sweetalert2'


type RoomParams = {
    id:string;
}

type MessageType = {
    viewed:boolean,
    id:string,
    key:number,
    content:string;
    author:{
        id:string, 
        name:string,
    },
    hasImage:boolean;
    time:number,
}

type roomType = {
    hasMsgs:boolean,
    lastMsg:number,
    name:string,
    image:string,
    users:string[],
    lastMsgBy:string,
    usersInfo:{
      id:string,
      image:string,
      name:string,
    }[]
}

export default function ChatRoom(){

    const [messages, setMessages] = useState<MessageType[]>([])
    const {user, dropOpen, setDropOpen, theme} = useAuth()
    const [newMessage, setNewMessage] = useState("")
    const [newImage, setNewImage] = useState<File | null>();
    const [otherAvatar, setOtherAvatar] = useState<string[]>([])
    const [otherUsers, setOtherUsers] = useState<string[]>([])
    const [groupName, setGroupName] = useState<string>("")
    
    const params = useParams<RoomParams>();
    const chatCode = params.id;

    const navigate = useNavigate();

    useEffect(() =>{
        window.scrollTo(0, document.body.scrollHeight);
    })
    useEffect(() =>{
        if(user?.id === 'noUser') navigate("/login");
        if(user?.id !== undefined){
            getOtherImage();
        }
      }, [user])

    useEffect(() =>{
       
        getMessages()
        setDropOpen(false)
       
        getRoomName()
    
        
    }, [])

 
    
    async function getRoomName(){
        const isGroup = await getIsGroup();
        const docInfo = await getDoc(doc(firestore, "rooms", `${chatCode}`))
        if(isGroup){
        setGroupName(docInfo.data()?.name)
        }
        else{
            const userInfo = docInfo.data()?.usersInfo
            const other = userInfo?.find((userI:any)=>userI.id !== user?.id)
            setGroupName(other.name)
        }
    }
    async function getIsGroup(){
        const docInfo = await getDoc(doc(firestore, "rooms", `${chatCode}`))
          if(docInfo.data()?.users.length>2){
            return(true)

        }
        else{
            return(false)
        }
    }

    async function getOtherImage(){
        const chatIds:any = chatCode?.split("-")
        var otherId:any
        var otherImgs
        const isGroup = await getIsGroup
        if(chatIds.length > 2){
        otherId = chatIds?.map((id:any) => {
            if(id !== user?.id){
                return id as string
            }
        else{
            return "error"
        }})
            
        otherImgs = []
        var otherNames:string[] = []
        otherId.map(async(id:any)=>{
            if(id !== "error" && id !== "group"){
            const q = query(collection(firestore, "users"), where("id", "==", `${id as any}`))
            const docs = await getDocs(q)
            otherImgs.push(docs.docs[0].data().image)
            otherNames.push(docs.docs[0].data().name)
            }
        })
        setOtherUsers(otherNames)
    }
    else{
       otherId = chatIds.find((cId:string) => cId != user?.id)
       const q = query(collection(firestore, "users"), where("id", "==", `${otherId}`))
       const docs = await getDocs(q)
       otherImgs = docs.docs[0].data().image
       const otherUser = docs.docs[0].data().name
       setOtherAvatar([otherImgs])
        setOtherUsers([otherUser])
    }
    if(chatIds.length>2){
        setOtherAvatar(otherImgs)

    }
    }

    async function setRoomToViewed(){
       
        if(user?.id === 'noUser' || user === undefined) {
            return
        }
        const docRef = doc(firestore, "rooms", chatCode as string)
        const docData = await getDoc(docRef)
        if(docData===null) return
        
        if(docData.data()?.lastMsgBy === user?.id) return
        const roomData:roomType = {
            lastMsg: docData.data()?.lastMsg,
            name:docData.data()?.name,
            users:docData.data()?.users,
            image:docData.data()?.image || null,
            usersInfo:docData.data()?.usersInfo,
            hasMsgs:false,
            lastMsgBy:"none",
        }
        await setDoc(docRef, roomData)
        await setMessagesToViewed()
    }

    async function setMessagesToViewed(){
        
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
          setTimeout(() =>{
            setRoomToViewed();
          }, 500)
        
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
            author:{
                id:user?.id, 
                name:user?.name,
            },
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
            name:docData.data()?.name,
            users:docData.data()?.users,
            image:docData.data()?.image || null,
            usersInfo:docData.data()?.usersInfo,
            hasMsgs:true,
            lastMsgBy:user?.id as string,
        }
         setDoc(docRef, roomData)
    }

   
    async function sendImage(key:any){
        const imageRef = refStorage(storage, `images/${chatCode}/${key}`)

        
        await uploadBytes(imageRef, newImage as File).then((snapshot) => {
            });
          setNewImage(undefined);

    }
    function handleDropdown(){
        const drop = document.querySelector(".drop-header");
        if(drop?.classList.contains("visible")){
          drop.classList.remove("visible");
          setDropOpen(false)
        }
        else{
        drop?.classList.add("visible")
        setDropOpen(true)
        }
  }

    async function handleDeleteChat(){
        handleDropdown()
        Swal.fire({
            title:"Are you sure?",
            text:"You will lose this contact",
            showCancelButton:true,
            confirmButtonColor:theme,
        }).then(async(result) =>{
            if(result.isConfirmed){
                await deleteDoc(doc(firestore, "rooms", chatCode as string))
                navigate("/")
            }
            else{
                return 
            }
        })
        
    }
    async function handleDeleteMessages(){
        handleDropdown();
        Swal.fire({
            title:"Are you sure?",
            text:"All the messages will be deleted",
            showCancelButton:true,
            confirmButtonColor:theme,
        }).then(async(result) =>{
            if(result.isConfirmed){
                const messages = await getDocs(collection(firestore, "rooms", chatCode as string, "messages"))
                messages.docs.forEach(message =>{
                    deleteDoc(doc(firestore, "rooms", chatCode as string, "messages", message.id))
                })
            }
            else{
                return 
            }
        })
    }
    async function handleChangeGroupName(){
        handleDropdown()
       const newName = await Swal.fire({
            title:"Group name change", 
            text:"Choose a name",
            input: 'text',
            confirmButtonColor:theme,
            showCancelButton:true,
            inputAttributes: {
              autocapitalize: 'off'
            },
            confirmButtonText:"change",
            
        })
        if(newName === undefined) return
        const roomInfo = await getDoc(doc(firestore, "rooms", `${chatCode}`))
        const roomInfoRight:any = roomInfo.data()
        const newInfo = {
            hasMsgs:roomInfoRight.hasMsgs,
            lastMsg:roomInfoRight.lastMsg, 
            name:newName.value, 
            users:roomInfoRight.users, 
            usersInfo:roomInfoRight.usersInfo,
            image:roomInfoRight.image,
        }
        setDoc(doc(firestore, "rooms", `${chatCode}`), newInfo)
        setGroupName(newInfo.name)
    }
    async function handleChangeGroupImage(){
        handleDropdown()
       const {value: newImage} = await Swal.fire({
            title:"Group image change", 
            text:"Choose an image in your system",
            input: 'file',
            confirmButtonColor:theme,
            showCancelButton:true,
            inputAttributes: {
                'accept': 'image/*',

            },
            confirmButtonText:"change",
            
        })
        if(newImage === undefined || newImage === null) return
        const imageRef = refStorage(storage, `images/${chatCode}/main_image`)

        
        await uploadBytes(imageRef, newImage).then((snapshot) => {
        });
        const roomInfo = await getDoc(doc(firestore, "rooms", `${chatCode}`))
        const roomInfoRight:any = roomInfo.data()
        const newInfo = {
            hasMsgs:roomInfoRight.hasMsgs,
            lastMsg:roomInfoRight.lastMsg, 
            name:roomInfoRight.name, 
            users:roomInfoRight.users, 
            usersInfo:roomInfoRight.usersInfo,
            image:imageRef.fullPath,
        }
        setDoc(doc(firestore, "rooms", `${chatCode}`), newInfo)
    }

    return(
        <>
        <Header avatar={otherAvatar}>
            <h2>{groupName}</h2>
           
            {otherUsers.length>1?
            //is Group?
            <>
            {otherUsers.map((user, key) =>{
              
                return <p key={key}>{user.split(" ")[0]}</p>
                })}
            <a onClick={() =>{handleChangeGroupImage()}}>Group image</a>
             <a onClick={() =>{handleChangeGroupName()}}>Group name</a>
             </>
             :null
            }
           
            <a className="delete" onClick={() => handleDeleteChat()}>Delete Chat</a>
            <a className="delete" onClick={() => handleDeleteMessages()}>Delete Messages</a>
        </Header>
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