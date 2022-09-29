const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const handleUserProfile = (req, res) => {
   
    const identifier = req.user.profile.preferred_username;
    const accessToken = req.user.accessToken;
    const name = req.user.profile.name;
    
    const authToken= jwt.sign({identifier, accessToken},
        "yourSecretKey",
        { expiresIn: "30d" });
    
    res.render('user', {
        username: name,
        client: req.user.profile.audience,
        token: encodeURIComponent(authToken),
        accessToken: accessToken,
        refreshToken: req.user.refreshToken
    });
}

router.get('/', handleUserProfile);

module.exports = router;