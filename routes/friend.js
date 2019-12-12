const express = require('express')
const router = express.Router();

router.get('/AddFriends' , (req,res) => {
    res.render('addfriend' , {obj : req.session.data});
})

router.get('/friendRequests' , (req,res) => {
    res.render('friendrequest' , {obj : req.session.data});
})

module.exports = router