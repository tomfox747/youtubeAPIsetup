import React from 'react';
import {useState, useEffect, useLayoutEffect} from 'react'
import './App.css';
import Axios from 'axios'


var ngRokDomain = "http://localhost:8080"

function App() {
  const[authCode, setAuthCode] = useState(null)

  useEffect(() =>{
    console.log("new code has been set " + authCode)
    if(authCode !== null){
      Axios.post('/setCode',{
        code:authCode
      })
      .then((res) =>{
        console.log(res.data)
      })
      .catch((err) =>{
        console.log(err)
      })
    }
  }, [authCode])

  useEffect(() =>{
    let params = (new URL(document.location)).searchParams;
    let code = params.get("code");
    if(code !== ""){
      setAuthCode(code)
    }else{
      console.log("no code found")
    }
  }, [])

  const authenticate = () =>{
    console.log("authenticating")
    Axios.get('/auth')
    .then((res) =>{
      console.log(res.data)
      if(res.data === true){ // if user authenticated returns true
        alert("user is already authenticated")
        window.location.replace(ngRokDomain)
      }else{
        window.location.replace(res.data)
      }
    })
    .catch((err) =>{
      console.log(err)
    })
  }


  const setAccessToken = () =>{
    console.log("setting access token")
  }

  const uploadVideo = () =>{
    console.log("uploading video")
    Axios.post('/uploadVideo',{
      input:"hello from client"
    })
    .then((res)=>{
      console.log(res)
      alert("video was uploaded")
    })
    .catch((err) =>{
      console.log(err)
    })
  }
  const getVids = () =>{
    console.log("getting your videos")
    Axios.get('/getVideoObjects')
    .then((res) => {
      console.log(res.data)
    })
    .catch(err =>{
      console.log(err)
    })
  }

  const ping = () =>{
    Axios.get('/ping')
    .then((res) =>{
      console.log(res.data)
    })
    .catch(err =>{
      console.log(err)
    })
  }
  
  return (
    <div className="App">
      <p>Youtube API test project</p>
      <button onClick={() => authenticate()}>Authenticate</button>
      <button onClick={() => setAccessToken()}>Set access token</button>
      <button onClick={() => uploadVideo()}>Upload Youtube Video</button>
      <button onClick={() => getVids()}>Get Videos for Username</button>
      <button onClick={() => ping()}>Ping</button>
    </div>
  );
}

export default App;
