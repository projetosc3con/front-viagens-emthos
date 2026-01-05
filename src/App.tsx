import React, { useEffect, useState } from 'react';
import { auth } from './util/FirebaseConnection';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import NavbarTop from './template/navbar';
import Content from './template/content';
import Rotas from './Router';
import { BrowserRouter as Router } from 'react-router-dom';
import { User, onAuthStateChanged } from 'firebase/auth';
import Login from './pages/login';
import { UserProvider } from './context/UserContext';

function App() {
  const [user, setUser] = useState<User>();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    onAuthStateChanged(auth, async(user) => {
      if(user) {
        setUser(user);
        setEmail(user.email);
      } else {
        setUser(undefined);
      }
    })
  }, [])

  if(!email || user === undefined) {
    return (<Login/>);
  } else {
    return (
      <div className="App">
        <Router>
          <UserProvider email={email}>
          <NavbarTop/>
          <Content>
            <Rotas />
          </Content>
          </UserProvider>
        </Router>
      </div>
    );
  }
}

export default App;
