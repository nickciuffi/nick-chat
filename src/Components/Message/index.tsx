import {useAuth} from '../../hooks/useAuth'
import cn from 'classnames'
import './styles.scss'
import {useEffect, useState} from 'react'
import {storage, refStorage, getDownloadURL} from '../../services/firebase'

type PropsType = {
    id:string,
    content: string,
    author: string,
    hasImage:boolean,
    chatCode:string,
}



export default function Message(props:PropsType){

    const {user} = useAuth()
    const [urlImg, setUrlImg] = useState("");
    const [imgBig, setImgBig] = useState("");

    useEffect(() =>{
        setTimeout(() =>{
            getDownloadURL(refStorage(storage, `images/${props.chatCode}/${props.id}`))
            .then((url) => {
               setUrlImg(url)
            }) 
           
        }, 2000)
       
    }, [])

    function handleImgClick(event:any){

        if(event.target.classList.contains("big-image")){
            const lastBig = document.querySelector(".big-image")
            lastBig?.classList.remove('big-image')
            return
        }
        const lastBig = document.querySelector(".big-image")
        lastBig?.classList.remove('big-image')
        setImgBig(event.target.id)
        event.target.classList.add("big-image")

    }
   
    return(
      
        <div className={cn('message', {send:props.author === user?.id}, {received:props.author !== user?.id})}>
      <>
      { 
          props.hasImage?
          urlImg === ""?
          <p>Loading...</p>
          :
          <a onClick={event => handleImgClick(event)}>
          <img id={props.id} src={urlImg} alt={`image from${props.id}`}/>
          </a>
          :null
      }
    {props.content}
    </>
    </div>
    
    )
}