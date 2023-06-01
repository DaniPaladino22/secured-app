const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const handleUserProfile = (req, res) => {
    
    const identifier = req.user._json.preferred_username;
    const accessToken = req.user.accessToken;
    const name = req.user._json.name;
    
    const authToken= jwt.sign({identifier, accessToken},
        "4f6c007e337ad871a3c735a84206721f",
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