import './styles.scss'
import {useNavigate} from 'react-router-dom'

type contactType = {
    name: string, 
    code: string,
}

export default function Contact(props:contactType){

    const navigate = useNavigate();

    function handleContactClick(code:string){
        navigate(`/chat/${code}`)
    }

    return(
        <a className="contact" onClick={() => handleContactClick(props.code)}>
            <img src="https://lh3.googleusercontent.com/a-/AOh14Ghqpue8NcUtSOR1QMyhqrNA44zyCm3mBY9h4T8vsw=s96-c" alt="contact image" />
            <p>{props.name}</p>
        </a>
    )
}