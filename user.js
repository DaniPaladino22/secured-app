const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const handleUserProfile = (req, res) => {
    console.log('*****user_profile: '+req.user._json.preferred_username);
    console.log('*****user_profile: '+JSON.stringify(req.user));

    const identifier = req.user._json.preferred_username;
    const accessToken = req.user.accessToken;
    const name = req.user._json.name;

    console.log('*****identifier: '+ identifier);
    console.log('*****accessToken: '+ accessToken);
    console.log('*****name: '+ name);

    
    const authToken= jwt.sign({identifier, accessToken},
        "yourSecretKey",
        { expiresIn: "30d" });
    
    res.render('user', {
        username: name,
        token: encodeURIComponent(authToken),
        accessToken: accessToken,
        refreshToken: req.user.refreshToken
    });
    

}

router.get('/', handleUserProfile);

module.exports = router;