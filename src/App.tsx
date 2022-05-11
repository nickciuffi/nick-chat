import {ContextProvider} from './contexts/Context'
import {useAuth} from './hooks/useAuth';
import Home from './pages/Home';
import LogIn from './pages/LogIn'
import ChatRoom from './pages/ChatRoom';
import './styles/global.scss' 
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import { useEffect } from 'react';


function App() {
 

  return (
    <Router>
    <ContextProvider>
      <Routes>
    <Route element={<Home/>} path="/"/>
    <Route element={<LogIn />} path="/login" />
    <Route element={<ChatRoom />} path="/chat/:id" />
    </Routes>
    </ContextProvider>
    </Router>
  );
}

export default App;
