import { addDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { useEffect, useState, createContext, ReactNode } from "react";
import {firestore, collection, query, where, auth, GoogleAuthProvider, signInWithPopup} from '../services/firebase'

  type ContextType = {
    user: User | undefined,
    signInWithGoogle: () => Promise<void>;
    dropOpen:boolean,
    setDropOpen:any,
    theme:string, 
    setTheme:any,
  }
  
  type User ={
    id:string,
    name:string,
    avatar:string,
  }

  type ContextProviderProps = {
      children: ReactNode
  }

export const Context = createContext({} as ContextType)

export function ContextProvider(props: ContextProviderProps){

    const [user, setUser] = useState<User>();
    const [dropOpen, setDropOpen] = useState(false)
    const [theme, setTheme] = useState("#4d63c4")

    useEffect(() =>{
      const unsubscribe = auth.onAuthStateChanged(user =>{
        if(user){
          const { displayName, photoURL, uid } = user
  
          if(!displayName || !photoURL){
            throw new Error('Missing information from google acount');
          }
          setUser({
            id: uid,
            name: displayName,
            avatar: photoURL
          })
        }
        else{
            setUser({id:'noUser', name:'noUser', avatar:'nopUser'})
        }
      })
      return () =>{
        unsubscribe();
      }
  
    }, []);

    useEffect(() =>{
      loginFirestore()
    }, [user])
  
    async function signInWithGoogle(){
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
     
        if(result.user){
          const { displayName, photoURL, uid } = result.user
  
          if(!displayName || !photoURL){
            throw new Error('Missing information from google acount');
          }
          setUser({
            id: uid,
            name: displayName,
            avatar: photoURL
          })
          
      }
    }

    async function loginFirestore(){
      if(user === undefined || user.id ==="noUser") return

      const users = collection(firestore, "users");
      const q = query(users, where("id", "==", user?.id))
      const usersWithId = await getDocs(q)
      if(usersWithId.empty){
        //create user in firestore
        createUser()
      }
      else{
        console.log("user already exists")
      }
    }

    async function createUser(){
      
      await setDoc(doc(firestore, "users", `${user?.id}`), { 
        id:user?.id,
        name:user?.name,
        image:user?.avatar,
      })
    }

    return (
        <Context.Provider value={{user, signInWithGoogle, dropOpen, setDropOpen, theme, setTheme}}>
            {props.children}
        </Context.Provider>
    );
}