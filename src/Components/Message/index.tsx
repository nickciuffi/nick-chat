import {useAuth} from '../../hooks/useAuth'
import cn from 'classnames'
import './styles.scss'
import {useEffect, useState} from 'react'
import {storage, refStorage, getDownloadURL} from '../../services/firebase'
import receivedLoad from '../../assets/images/received-load.gif'
import sentLoad from '../../assets/images/sent-load.gif'

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
        if(!props.hasImage) return
        setTimeout(() =>{

            getDownloadURL(refStorage(storage, `/images/${props.chatCode}/${props.id}`))
            .then((url) => {
               setUrlImg(url)
            }) 
            .catch(() =>{
               //lazy load
                setTimeout(() =>{
                    getDownloadURL(refStorage(storage, `/images/${props.chatCode}/${props.id}`))
                    .then((url) => {
                        
                       setUrlImg(url)
                    }) 
                    .catch(() =>{
                        //lazy load
                        setTimeout(() =>{
                            getDownloadURL(refStorage(storage, `/images/${props.chatCode}/${props.id}`))
                            .then((url) => {
                                
                               setUrlImg(url)
                            }) 
                            .catch(() =>{
                                //lazy load
                                setTimeout(() =>{
                                    getDownloadURL(refStorage(storage, `/images/${props.chatCode}/${props.id}`))
                                    .then((url) => {
                                        
                                       setUrlImg(url)
                                    }) 
                                    .catch(() =>{
                                        //lazy load
                                        setTimeout(() =>{
                                            getDownloadURL(refStorage(storage, `/images/${props.chatCode}/${props.id}`))
                                            .then((url) => {
                                                
                                               setUrlImg(url)
                                            }) 
                                        }, 15000)
                                        }
                                        )
                                }, 10000)
                                }
                                )
                        }, 60000)
                        }
                    )
                }, 3000)
                }
            )
        }, 1000)
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
          props.author !== user?.id?
          <img className="loading" src={receivedLoad} alt="loading..." />
          :
          <img className="loading" src={sentLoad} alt="loading..." />
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