const {google} = require('googleapis')
const youtube = require('youtube-api')
const OAuth2  = google.auth.OAuth2
const fs  = require('fs')


const credentials = require('./database/credentials.json')

/********************************
 * variables
 */
var ClientId = credentials.web.client_id
var ClientSecret = credentials.web.client_secret
var RedirectUrl = "http://871c43ae.ngrok.io"
//api key = AIzaSyClokCm5RDTCkNY9N7ninR3No967wvFEz4


function authenticate(){
    var oauth2Client = getOAuthClient()
    url = getAuthUrl(oauth2Client)
    return url
}

/********************************
 * createoAuthClient, this may need to be updated to in the future to alter based on user that is logged in
 */
function getOAuthClient(){
    return new OAuth2(ClientId, ClientSecret, RedirectUrl)
}

/********************************
 * generate oauth login url
 */
function getAuthUrl(oauth2Client){
    var scopes = ['https://www.googleapis.com/auth/youtube.upload','https://www.googleapis.com/auth/youtube','https://www.googleapis.com/auth/youtube.readonly']
    var url = oauth2Client.generateAuthUrl({
            access_type:'offline',
            scope:scopes,
            approval_prompt: 'force'
    })
    return url
}

/*******************************
 * generate an access token for the url response code
 */
async function getToken(code){
    console.log("CODE == " + code)
    var oauth2Client = getOAuthClient()
    try{
        var tokens = await oauth2Client.getToken(code)
        return tokens.tokens.access_token
    }catch(err){    
        console.log(err)
    }
}



/*******************************
 * set client credentials and upload a youtube video
 */
async function uploadVideo(fileName, accessToken){
    var oauth2Client = getOAuthClient()
    
    oauth2Client.setCredentials({
        access_token:accessToken
    })

    const Youtube = google.youtube({
        version:'v3',
        auth:oauth2Client
    })

    const fileSize = fs.statSync(__dirname + '/videos/' + fileName)
    console.log("upload file size = " + fileSize)
    const response = Youtube.videos.insert({
            part:'id,snippet,status',
            notifySubscribers:false,
            requestBody:{
                snippet:{
                    title:"video upload from app",
                    description:"this is a test video"
                },
                status:{
                    privacyStatus:'public'
                }
            },
            media:{
                body:fs.createReadStream(__dirname + '/videos/' + fileName)
            }
        },(err, data) =>{
            if(err){
                console.log(err)
                return "upload error"
            }
            else{
                console.log("upload completed")
                return data
            }
        }
    )
}

module.exports = {
    authenticate,
    getToken,
    uploadVideo
}