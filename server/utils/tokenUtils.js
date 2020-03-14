/****************************************
 * Check whether token is available for a specified username
 */
function checkForToken(tokens, username){
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

function findToken(tokens, username){
    var refreshToken
    for(var tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++){
        if(tokens[tokenIndex].userName === username){
            refreshToken = tokens[tokenIndex].refreshToken
        }
    }
    return refreshToken
}

module.exports = {
    checkForToken,
    findToken
}