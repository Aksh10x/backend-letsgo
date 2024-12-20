import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from "axios";
import { useEffect } from 'react';

function App() {
  const [jokes,setJokes] = useState([]);

  useEffect(() => {
    axios.get("/api/jokes")
    .then((respone) => {
      console.log(respone, respone.data)
      setJokes(respone.data)
    })
    .catch((error) => {
      console.log(error)
    })
  });

  return (
    <>
      <h1>welcome my site</h1>
      <p>Jokes: {jokes.length}</p>
      {jokes?.map((joke) => (
        <div key={joke.id}>{joke.joke}</div>
       ) )
      }
    </>
  )
}

export default App
