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
const {getTokens, setToken, saveVideo, getVideoObjects} = require('./database/manageDB.js')
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
    console.log("authenticating user")
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
    var accessToken = await findToken(tokens, userName)
    var fileName = 'pianoClip.mp4' //video must be stored in the local server videos folder
    
    uploadVideo(fileName, accessToken)
    .then((videoResponse) =>{
        console.log("video upload completed")
        console.log(videoResponse)
        var videoData = videoResponse.data
        var videoObject = {
            ID:videoData.id,
            title:videoData.snippet.title,
            description:videoData.snippet.description,
            pulishedAt:videoData.snippet.publishedAt,
            author:userName,
            lightUps:0
        }
        console.log("video object below")
        console.log(videoObject)
        saveVideo(videoObject)
    })
    .catch(err =>{
        console.log(err)
    })
})

/** video response object format
{
  config: {
    url: 'https://www.googleapis.com/upload/youtube/v3/videos?part=id%2Csnippet%2Cstatus&notifySubscribers=false&uploadType=multipart',
    method: 'POST',
    paramsSerializer: [Function],
    data: PassThrough {
      _readableState: [ReadableState],
      readable: false,
      _events: [Object: null prototype],
      _eventsCount: 2,
      _maxListeners: undefined,
      _writableState: [WritableState],
      writable: false,
      allowHalfOpen: true,
      _transformState: [Object],
      _flush: [Function: flush],
      [Symbol(kCapture)]: false
    },
    headers: {
      'x-goog-api-client': 'gdcl/3.2.2 gl-node/12.16.1 auth/5.10.1',
      'Content-Type': 'multipart/related; boundary=afc8aac9-7f60-4337-b283-fe2f25d60fef',
      'Accept-Encoding': 'gzip',
      'User-Agent': 'google-api-nodejs-client/3.2.2 (gzip)',
      Authorization: 'Bearer ya29.a0Adw1xeUwLHZlmAPI_xN7pHPo192dURVQ1Tv9VMHVVmzalUW9RQpyAc-1kU_KSnUogoe-6Sjvx4RnHlmDuGoKBsxg4khIHT6wffX1EysuDrn7AfG_pX7RGAXmudiSZCpqmwf8IJM517uB7BNU7Oc7j-ZzQyM0eg0C80OS',
      Accept: 'application/json'
    },
    params: [Object: null prototype] {
      part: 'id,snippet,status',
      notifySubscribers: false,
      uploadType: 'multipart'
    },
    validateStatus: [Function],
    retry: true,
    body: PassThrough {
      _readableState: [ReadableState],
      readable: false,
      _events: [Object: null prototype],
      _eventsCount: 2,
      _maxListeners: undefined,
      _writableState: [WritableState],
      writable: false,
      allowHalfOpen: true,
      _transformState: [Object],
      _flush: [Function: flush],
      [Symbol(kCapture)]: false
    },
    responseType: 'json'
  },
  data: {
    kind: 'youtube#video',
    etag: '"SJZWTG6xR0eGuCOh2bX6w3s4F94/LVMz6FlbT8zxtb0KUcGEVH8aNcs"',
    id: 'd3Bj3vxT-_w',
    snippet: {
      publishedAt: '2020-03-15T17:09:04.000Z',
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
  },
  headers: {
    'alt-svc': 'quic=":443"; ma=2592000; v="46,43",h3-Q050=":443"; ma=2592000,h3-Q049=":443"; ma=2592000,h3-Q048=":443"; ma=2592000,h3-Q046=":443"; ma=2592000,h3-Q043=":443"; ma=2592000',
    'cache-control': 'no-cache, no-store, max-age=0, must-revalidate',
    connection: 'close',
    'content-length': '1023',
    'content-type': 'application/json; charset=UTF-8',
    date: 'Sun, 15 Mar 2020 17:09:07 GMT',
    etag: '"SJZWTG6xR0eGuCOh2bX6w3s4F94/LVMz6FlbT8zxtb0KUcGEVH8aNcs"',
    expires: 'Mon, 01 Jan 1990 00:00:00 GMT',
    pragma: 'no-cache',
    server: 'UploadServer',
    vary: 'Origin, X-Origin',
    'x-goog-correlation-id': 'd3Bj3vxT-_w',
    'x-guploader-uploadid': 'AEnB2Uo3R-lCkixWxBgakGTlmVbxPTrFPJ_dzvXJOHTiRNwMpMn-OE5NBwfVdmM8bMAMk9Nap3tjObQzxdSGP87NKpH9TmK3Tb22cNa3fBmWZEZEFjBoMyw'
  },
  status: 200,
  statusText: 'OK',
  request: {
    responseURL: 'https://www.googleapis.com/upload/youtube/v3/videos?part=id%2Csnippet%2Cstatus&notifySubscribers=false&uploadType=multipart'
  }
}
 */

app.get('/getVideoObjects', (req,res) =>{
    console.log("retrieving videos")
    let videos = getVideoObjects()
    res.send(videos)
})

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