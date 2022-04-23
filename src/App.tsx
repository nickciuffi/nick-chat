import {AuthContextProvider} from './contexts/AuthContext'
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


function App() {

  return (
    <Router>
    <AuthContextProvider>
      <Routes>
    <Route element={<Home/>} path="/"/>
    <Route element={<LogIn />} path="/login" />
    <Route element={<ChatRoom />} path="/chat/:id" />
    </Routes>
    </AuthContextProvider>
    </Router>
  );
}

export default App;
