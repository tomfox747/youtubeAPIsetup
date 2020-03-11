function checkForToken(tokens, username){
    var found = false
    for(var i = 0; i < tokens.length; i++){
        if(tokens[i].userName === username){
            console.log("user already authenticated into the site")
            if(tokens[i].accessToken !== "" || tokens[i].accessToken !== undefined){
                found = true
                break
            }
        }
    }

    return found
}

module.exports = {
    checkForToken
}