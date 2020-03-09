const express = require("express")
const path =  require('path')
const favicon = require("express-favicon")
const cors = require('cors')
const bodyParser = require('body-parser')

const fs = require('fs')
const {google} = require('googleapis')
const OAuth2 = google.auth.OAuth2
const readline = require('readline')
const youtube = require('youtube-api')
const {authenticate, getToken} = require('./authentication')

const app = express()
const port = 8080

app.use(cors())
app.use(favicon(__dirname + '/favicon.ico'))
app.use(express.static(__dirname))
app.use(express.static(path.join(__dirname, '../client/build')))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const userName = "tomfox747"
const {getTokens, setToken} = require('./database/manageDB.js')

//api authenticate
app.get('/auth', async (req,res) =>{
    var tokens = await getTokens()
    var found = false
    for(var i = 0; i < tokens.length; i++){
        if(tokens[i].userName === "tomfox747"){
            console.log("user already authenticated into the site")
            if(tokens[i].accessToken !== ""){
                found = true
                break
            }
        }
    }
    if(found){
        res.redirect('http://localhost:8080')
    }else{
        url = authenticate()
        res.redirect(url) // redirect will trigger response from the client to call 'setCode'
    }
})

//api set access token
app.post('/setCode', async (req,res) =>{
    var code  = req.body.code
    console.log("code = " + code)
    var accessToken = await getToken(code)
    //save the access token to the current user
    try{
        await setToken(userName, accessToken)
        res.redirect('http://localhost:8080')
    }catch(err){
        console.log(err)
        res.send("set code error")
    }
})

//api get video information




app.get('/ping', (req,res) =>{
    res.send("pong")
})

app.get('/', (req,res) =>{
    res.send("running")
})

app.listen(port, () =>{
    console.log(`server listening on port ${port}`)
}).on('error', (err) =>{
    console.log(err)
})