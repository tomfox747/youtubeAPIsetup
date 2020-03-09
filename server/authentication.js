const {google} = require('googleapis')
const youtube = require('youtube-api')
const OAuth2  = google.auth.OAuth2

const credentials = require('./database/credentials.json')
const tokensFile = require('./database/tokens.json')

/********************************
 * variables
 */
var ClientId = credentials.web.client_id
var ClientSecret = credentials.web.client_secret
var RedirectUrl = "http://4d453f38.ngrok.io"
//api key = AIzaSyClokCm5RDTCkNY9N7ninR3No967wvFEz4


function authenticate(){
    var oauth2Client = getOAuthClient()
    url = getAuthUrl(oauth2Client)
    return url
}

/********************************
 * createoAuthClient
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


module.exports = {
    authenticate,
    getToken
}