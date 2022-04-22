import {useAuth} from '../../hooks/useAuth'
import cn from 'classnames'
import './styles.scss'

type PropsType = {
    content: string,
    author: string,
}

export default function Message(props:PropsType){

    const {user} = useAuth()

    return(
        <div className={cn('message', {send:props.author === user?.id}, {received:props.author !== user?.id})}>{props.content}</div>
    )
}