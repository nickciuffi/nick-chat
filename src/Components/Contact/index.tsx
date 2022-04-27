import './styles.scss'
import {useNavigate} from 'react-router-dom'

type contactType = {
    name: string, 
    code: string,
    image:string,
}

export default function Contact(props:contactType){

    const navigate = useNavigate();

    function handleContactClick(code:string){
        navigate(`/chat/${code}`)
    }

    return(
        <a className="contact" onClick={() => handleContactClick(props.code)}>
            <img src={props.image} alt="contact image" />
            <p>{props.name}</p>
        </a>
    )
}