const MongoClient = require('mongodb').MongoClient
const uri = "mongodb+srv://tomfox:Epiphonedb94@practicecluster-onmkw.mongodb.net/test?retryWrites=true&w=majority"
const client = new MongoClient(uri, {useNewUrlParser:true,  useUnifiedTopology:true})
const {checkForToken, findToken, checkForAuthenticatedUser} = require('../utils/tokenUtils')

const DBconnect = async () =>{
    console.log("connecting to the database")
    try{
        await client.connect()
        console.log("connected to the database")
    }catch(err){
        console.log("DB connection error => " + err)
    }
}

async function getTokens(){
    console.log("getting tokens")
    await DBconnect()
    var db = client.db("youtubeTest")
    var tokens = db.collection("tokens")
    tokens = tokens.find({}).toArray()
    return tokens
}
async function setToken(userName, access_token, refresh_token){
    await DBconnect()
    var db = client.db("youtubeTest")
    var tokens = db.collection("tokens")

    let userFound = checkForAuthenticatedUser(userName, tokens)

    if(userFound === true){
        var myquery = { userName: userName };
        var newvalues = { $set: {userName: userName, accessToken: access_token, refreshToken: refresh_token } };
        tokens.updateOne(myquery, newvalues, function(err, res) {
          if (err) throw err;
          console.log("document updated");
        });
    }
    else{
        console.log("new authentication detected")
        let userObject = {
            userName:userName,
            accessToken:access_token,
            refreshToken:refresh_token
        }
        tokens = tokens.insertOne(userObject)
        console.log("new user document has been added")
    }
}


async function saveVideo(videoObject){
    await DBconnect()
    var db = client.db("youtubeTest")
    var videos = db.collection("videos")
    videos = videos.insertOne(videoObject)
    console.log("video has been saved")
}
async function getVideoObjects(){
    await DBconnect()
    return new Promise((resolve, reject) =>{
        try{
            let videos = client.db("youtubeTest").collection("videos") 
            videos = videos.find({}).toArray()
            resolve(videos)
        }
        catch(err){
            reject(err)
        }
    })
    
}

module.exports = {
    getTokens,
    setToken,
    saveVideo,
    getVideoObjects
}