import { addDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { useEffect, useState, createContext, ReactNode } from "react";
import {firestore, collection, query, where, auth, GoogleAuthProvider, signInWithPopup} from '../services/firebase'

  type AuthContextType = {
    user: User | undefined,
    signInWithGoogle: () => Promise<void>;
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
        <AuthContext.Provider value={{user, signInWithGoogle}}>
            {props.children}
        </AuthContext.Provider>
    );
}