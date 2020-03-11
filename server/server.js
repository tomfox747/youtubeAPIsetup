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
const {authenticate, getToken, uploadVideo} = require('./googleAPI')
const {getTokens, setToken, saveVideoID, getVideoIDs} = require('./database/manageDB.js')
const {checkForToken} = require('./utils/tokenUtils')

const app = express()
const port = 8080

app.use(cors())
app.use(favicon(__dirname + '/favicon.ico'))
app.use(express.static(__dirname))
app.use(express.static(path.join(__dirname, '../client/build')))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const userName = "tomfox747"


/*****************************************
 * Oauth google authentication check and process
 */
app.get('/auth', async (req,res) =>{
    var tokens = await getTokens()
    var found = checkForToken(tokens, userName)

    if(found){
        res.send("User already authenticated")
    }else{
        url = authenticate()
        res.redirect(url) // redirect will trigger response from the client to call 'setCode'
    }
})

/*****************************************
 * save access token to database using auth code
 */
app.post('/setCode', async (req,res) =>{
    var code  = req.body.code
    console.log("code = " + code)
    //save the access token to the current user
    try{
        var accessToken = await getToken(code)
        await setToken(userName, accessToken)
        res.send("user token has been added")
    }catch(err){
        console.log(err)
        res.send("An error occured when setting the accessToken")
    }
})

/*****************************************
 * Upload video call
 */
app.post('/uploadVideo', (req,res) =>{
    console.log("uploading video")
    
    try{
        var fileName = 'myVideo.mp4' //video must be stored in the local server videos folder
        var videoObject = uploadVideo()
        var videoID = videoObject.ID //Pseudo code
        saveVideoID(videoID)
    }catch(err){
        console.log("ERROR => " + err)
    }
})

/****************************************
/* api get video information
*/
app.get('/getVideos', (req,res) =>{
    console.log("retrieving videos")
    try{
        videoIDs = getVideoIDs()
        res.send(videoIDs)
    }catch(err){
        console.log("error " + err)
        res.send("server error, could not retrieve video IDs")
    }
})



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