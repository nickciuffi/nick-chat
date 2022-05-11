import { useContext} from 'react';
import { Context } from '../contexts/Context'

export function useAuth(){
const value = useContext(Context)
return value;
}