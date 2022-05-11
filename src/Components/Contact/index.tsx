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
        if(props.image === "none-group") return
        getDownloadURL(refStorage(storage, props.image[0]))
        .then((url) => {
           setImageGroup(url)
        }) 
        .catch(() =>{

        })

    }, [])
    
    function handleContactClick(code:string){
        navigate(`/chat/${code}`)
    }

    return(
        <a className={`contact ${props.hasMsgs?'hasmsgs':''}`} onClick={() => handleContactClick(props.code)}>
            <img src={
                props.isGroup?
                props.image[0] === "none-group"?
                //isGroup and has no image
                noneImage
                :
                //isGroup and has image
                imageGroup===""?
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