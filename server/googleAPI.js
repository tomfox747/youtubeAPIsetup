const {google} = require('googleapis')
const youtube = require('youtube-api')
const OAuth2  = google.auth.OAuth2
const fs  = require('fs')

//tomfox creds
const credentials = require('./database/credentials.json')

//thomasfox creds
//const credentials = require('./database/credentials.json')

//recurse creds
//const credentials = require('./database/credentialsRecurse.json')

/********************************
 * variables
 */
var ClientId = credentials.web.client_id
var ClientSecret = credentials.web.client_secret
var RedirectUrl = "http://f0e99077.ngrok.io"
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
            approval_prompt: 'force',
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
        console.log(tokens)
        var accessToken = tokens.tokens.access_token
        var refreshToken = tokens.tokens.refresh_token
        return [accessToken, refreshToken]
    }catch(err){    
        console.log(err)
    }
}



/*******************************
 * set client credentials and upload a youtube video
 */
async function uploadVideo(fileName, refreshToken){
    return new Promise((resolve, reject) =>{
        console.log("upload video google api called")
        var oauth2Client = getOAuthClient()
        
        oauth2Client.setCredentials({
            refresh_token:refreshToken
        })
    
        const Youtube = google.youtube({
            version:'v3',
            auth:oauth2Client
        })

        const fileSize = fs.statSync(__dirname + '/videos/' + fileName)
        console.log("upload file size = " + fileSize.size)
        Youtube.videos.insert({
            part:'id,snippet,status',
            notifySubscribers:false,
            requestBody:{
                snippet:{
                    title:"test video 3",
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
                reject(err)
            }
            console.log("API upload complete")
            resolve(data)
        }   
        )
    })
    
    
    /*
    const fileSize = fs.statSync(__dirname + '/videos/' + fileName)
    console.log("upload file size = " + fileSize.size)
    const response = await Youtube.videos.insert({
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
            console.log("API upload complete")
            
            return data
        }
    )*/
}

module.exports = {
    authenticate,
    getToken,
    uploadVideo
}