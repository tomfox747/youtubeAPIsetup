/****************************************
 * Check whether token is available for a specified username
 */
function checkForToken(tokens, username){
    console.log("checking for tokens")
    var found = false
    for(var i = 0; i < tokens.length; i++){
        if(tokens[i].userName === username){
            if(tokens[i].refreshToken !== "" || tokens[i].refreshToken !== undefined){
                found = true
                break
            }
        }
    }

    return found
}

/****************************************
 * get a the previously stored refresh token for a user
 */
function findToken(tokens, username){
    var refreshToken
    for(var tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++){
        if(tokens[tokenIndex].userName === username){
            refreshToken = tokens[tokenIndex].refreshToken
        }
    }
    return refreshToken
}


/****************************************
 * check whether user is already in the database
 */
function checkForAuthenticatedUser(userName, users){
    for(var userIndex = 0; userIndex < users.length; userIndex++){
        if(users[userIndex].userName === userName){
            return true
        }
    }
    return false
}

module.exports = {
    checkForToken,
    findToken,
    checkForAuthenticatedUser
}