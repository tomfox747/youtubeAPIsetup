const MongoClient = require('mongodb').MongoClient
const uri = "mongodb+srv://tomfox:Epiphonedb94@practicecluster-onmkw.mongodb.net/test?retryWrites=true&w=majority"
const client = new MongoClient(uri, {useNewUrlParser:true,  useUnifiedTopology:true})

const DBconnect = async () =>{
    try{
        await client.connect()
        console.log("connected to the database")
    }catch(err){
        console.log("DB connection error => " + err)
    }
}

async function getTokens(){
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
    var myquery = { userName: userName };
    var newvalues = { $set: {userName: userName, accessToken: access_token, refreshToken: refresh_token } };
    tokens.updateOne(myquery, newvalues, function(err, res) {
      if (err) throw err;
      console.log("document updated");
    });
}


async function saveVideoID(videoObject){
    await DBconnect()
    var db = client.db("youtubeTest")
    var videos = db.collection("videos")
    videos = videos.insertOne(videoObject)
}
async function getVideoObjects(){
    await DBconnect()
    var videos = client.db("youtubeText").collection("videos")
    videos = videos.find({}).toArray()
    return videos
}

module.exports = {
    getTokens,
    setToken,
    saveVideoID,
    getVideoObjects
}