import './styles.scss'
import {useNavigate} from 'react-router-dom'
import noneImage from '../../assets/images/no-image.png'
import { useEffect, useState } from 'react';
import { getDownloadURL } from 'firebase/storage';
import { refStorage, storage } from '../../services/firebase';

type contactType = {
    name: string, 
    code: string,
    image:string | string[],
    hasMsgs:boolean,
    isGroup:boolean,
}

export default function Contact(props:contactType){

    const navigate = useNavigate();
    const [imageGroup, setImageGroup] = useState<string>("")

    useEffect(() =>{
        if(!props.isGroup) return
        if(props.image[0] === "none-group") return
         getDownloadURL(refStorage(storage, props.image[0]))
        .then((url) => {
           setImageGroup(url)
        }) 
        .catch(() =>{
                           //lazy load
            setTimeout(() =>{
            getDownloadURL(refStorage(storage, props.image[0]))
            .then((url) => {
                
                setImageGroup(url)
        }) 
        .catch(() =>{
            setTimeout(() =>{
                getDownloadURL(refStorage(storage, props.image[0]))
                .then((url) => {
                    
                    setImageGroup(url)
                }) 
              
            }, 1000)
        })
    }, 500)
        })

    }, [])
    
    function handleContactClick(code:string){
        navigate(`/chat/${code}`)
    }
    function handleBiggerImage(e:any){
        e.stopPropagation();
        const bigImage = e.target
        //remove all the bigImages 
        const isBig = bigImage.classList.contains("bigger")
        const allBigs = document.querySelectorAll(".bigger")
        allBigs.forEach((big)=>{
            big.classList.remove("bigger")
        })
        if(isBig) return
        bigImage.classList.add("bigger")
        document.addEventListener('click', (event)=> {
            event.stopPropagation();
              
                bigImage.classList.remove("bigger")
          
          });
          
    }

    return(
        <a className={`contact ${props.hasMsgs?'hasmsgs':''}`} onClick={() => handleContactClick(props.code)}>
            <img onClick={(e)=>handleBiggerImage(e)} src={
                props.isGroup?
                props.image[0] === "none-group"?
                //isGroup and has no image
                noneImage
                :
                //isGroup and has image
                imageGroup===""?
                //while it is loading the image
                noneImage
                :
                imageGroup
                :
                //not group
                props.image[0]
            } alt="contact image" />
            <p>{props.name}</p>
        </a>
    )
}