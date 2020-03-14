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
const {getTokens, setToken, saveVideoID, getVideoObjects} = require('./database/manageDB.js')
const {checkForToken, findToken} = require('./utils/tokenUtils')

const app = express()
const port = 8080

//app.use(cors())
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
    var tokens = await getTokens() //get tokens from database
    var found = checkForToken(tokens, userName) //check if token exists for username
    
    if(found){
        console.log("user already authenticated")
        res.send(true)
    }else{
        url = authenticate() // begin google authentication process
        res.send(url) // redirect will trigger response from the client to call 'setCode'
    }
})

/*****************************************
 * save access token to database using auth code
 */
app.post('/setCode', async (req,res) =>{
    var code  = req.body.code // code is the auth code used to generate an acces token
    
    //save the access token to the current user
    try{
        var tokenArray = await getToken(code) // calls google api function to exchange auth code for access token
        await setToken(userName, tokenArray[0], tokenArray[1]) // save the token to the database
        res.send("user token has been added")
    }catch(err){
        console.log(err)
        res.send("An error occured when setting the accessToken")
    }
})

/*****************************************
 * Upload video call
 */
app.post('/uploadVideo', async (req,res) =>{
    console.log("uploading video")
    var tokens = await getTokens() //get tokens from database
    var accessToken = findToken(tokens, userName)
    try{
        var fileName = 'pianoClip.mp4' //video must be stored in the local server videos folder
        var videoResponse = await uploadVideo(fileName, accessToken) // call api function to upload video and return response object
        console.log("video upload completed")
        console.log(videoResponse)
        var videoData = videoResponse.data
        var videoObject = {
            ID:videoData.id,
            title:videoData.snippet.title,
            description:videoData.snippet.description,
            pulishedAt:videoData.snipped.publishedAt,
            author:userName,
            lightUps:0
        }
        saveVideoID(videoObject) // save the vides reponse object to the database
    }catch(err){
        console.log("ERROR => " + err)
    }
})

/** video response object format
 data: {
    kind: 'youtube#video',
    etag: '"SJZWTG6xR0eGuCOh2bX6w3s4F94/GtcrPjs3vYJeQ3810IQ8afbH7_A"',
    id: 'hDo3rzPgbGg',
    snippet: {
      publishedAt: '2020-03-12T20:35:28.000Z',
      channelId: 'UCCQnlC5hFzUAT3Am4OGVVBQ',
      title: 'video upload from app',
      description: 'this is a test video',
      thumbnails: [Object],
      channelTitle: 'Thomas Fox',
      categoryId: '22',
      liveBroadcastContent: 'none',
      localized: [Object]
    },
    status: {
      uploadStatus: 'uploaded',
      privacyStatus: 'public',
      license: 'youtube',
      embeddable: true,
      publicStatsViewable: true
    }
 */


app.post('/test', async (req,res) =>{
    console.log(req.body.data)
    res.send("did a thing")
})

/****************************************
/* api get video information
*/
app.get('/getVideos', (req,res) =>{
    console.log("retrieving videos")
    try{
        var videoObjects = getVideoObjects()
        res.send(videoObjects)
    }catch(err){
        console.log("error " + err)
        res.send("server error, could not retrieve video IDs")
    }
})



app.get('/ping', (req,res) =>{
    console.log("sending pong")
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