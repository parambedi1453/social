const express = require('express')
const router = express.Router()

const person = require('../models/person')
const chatinstance = require('../models/chat')


router.get('/',(req,res) => {
    res.render('loginpage')
})

router.get('/register' , (req,res)=>{
    res.render('signup')
})

router.post('/registeruser' ,(req,res) => {

    // Checking if user has already registed
    person.findOne({email : req.body.email} , (err,data)=>{
        if(err)
        throw err;
        else
        {
            if(data==null)
            {
                person.create(req.body , (err,result) => {
                    if(err)
                    throw err;
                    else
                    {
                        console.log(result);
                        res.send('AccountCreated')
                    }
                })
            }
            else{
            res.send('EmailExist')
            }
        }
    })
    
})

module.exports = router