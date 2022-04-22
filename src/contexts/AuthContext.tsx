import { useEffect, useState, createContext, ReactNode } from "react";
import {auth, GoogleAuthProvider, signInWithPopup} from '../services/firebase'

  type AuthContextType = {
    user: User | undefined,
    signInWithGoogle: () => Promise<void>;
    test:string,
  }
  
  type User ={
    id:string,
    name:string,
    avatar:string,
  }

  type AuthContextProviderProps = {
      children: ReactNode
  }

export const AuthContext = createContext({} as AuthContextType)

export function AuthContextProvider(props: AuthContextProviderProps){

    const [user, setUser] = useState<User>();

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
    const test = "ola"

    return (
        <AuthContext.Provider value={{user, signInWithGoogle, test}}>
            {props.children}
        </AuthContext.Provider>
    );
}