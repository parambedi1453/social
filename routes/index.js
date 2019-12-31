const express = require('express')
const router = express.Router()

const person = require('../models/person')
const chatinstance = require('../models/chat')
const groupinstance = require('../models/group')


router.get('/',(req,res) => {
    res.render('loginpage')
})

router.get('/register' , (req,res)=>{
    res.render('signup')
})

router.get('/home',(req,res)=>{
    res.render('home', {obj : req.session.data})
})
router.get('/chat' , (req,res)=>{
    res.render('chat',{obj : req.session.data})
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

router.post('/login',function(req,res){

    // console.log(req.body)
    person.findOne({email : req.body.email,password : req.body.password},function(err,data){
        if(err)
        throw err;
        else
        {
            // console.log(data);
            var sessionData = new Object();
            sessionData._id = data._id
            sessionData.username = data.username;
            sessionData.isLogin = 1;
            sessionData.friend = data.friend
            sessionData.requestin = data.requestin
            sessionData.requestout = data.requestout
            sessionData.personchat = data.personchat
            req.session.data = sessionData;

            res.send(data)
            
        }
    })
})


router.post('/addFriends',function(req,res){

    console.log(req.body)
    person.find({ $and : [{ '_id' : { $not : { $eq : req.session.data._id}}},{ '_id' :{ $nin : req.session.data.friend }},{ '_id' :{ $nin : req.session.data.requestin }},{ '_id' :{ $nin : req.session.data.requestout }}]}).exec(function(err,result){
        if(err)
        throw err;
        else
        res.send(result)
    })
    
})

router.post('/getFriends' , function(req,res){

    // var query = dbSchemas.SomeValue.find({}).select('name -_id');

    // query.exec(function (err, someValue) {
    //     if (err) return next(err);
    //     res.send(someValue);
    // });

    var query = [{path : 'friend' , select :{'username' : 1}}];
    person.findOne({"_id" : req.body.id}).populate(query).exec(function(err,result){
        if(err)
        throw err;
        else
        {
            console.log('****Frinnds for group*****')
            // console.log(result)
            res.send(result)
        }
    })
    
})
router.post('/sendRequest',function(req,res){

   
    person.updateOne({"_id" : req.body.id },{ $push : { requestin : req.session.data._id }},function(err,result){
        if(err)
        throw err;
        else
        {
            person.updateOne({"_id" : req.session.data._id},{ $push : { requestout : req.body.id}},function(err,result){
                if(err)
                throw err;
                else
                {
                    var ob = new Object();
                    // ob.firstfriend = req.body.id;
                    // ob.secondfriend = req.session.data._id;
                    arr = [];
                    arr.push(req.body.id)
                    arr.push(req.session.data._id)
                    ob.members = arr;
                    ob.message = [];
                    ob.lastmodified = Date.now()

                    chatinstance.create(ob,function(err,chat){
                        if(err)
                        throw err;
                        else
                        {
                            person.updateOne({"_id" : req.session.data._id},{$push : {personchat : chat._id}},function(err,result){
                                if(err)
                                throw err;
                                else
                                {
                                    console.log('personchat id added to first person')
                                    person.updateOne({"_id" : req.body.id},{$push : {personchat : chat._id}},function(err,result){
                                        if(err)
                                        throw err;
                                        else{
                                            console.log('person chat id added to second person')
                                            console.log('friend request send and chat id createdd')
                                            res.send("friend request send and chat id createdd")
                                        }
                                    })
                                }
                            }) 
                        }
                    })
                }
            })
        }
    })
})


router.post('/getRequests',function(req,res){
     
    var query = [{path : 'requestin',select :{'username' : 1}}];
    person.findOne({"_id" : req.body.id}).populate(query).exec(function(err,result){

        if(err)
        throw err;
        else
        {
            console.log('************')
            console.log(result)
            res.send(result)
        }
    })
})

router.post('/acceptRequest' , function(req,res){

    person.updateOne({"_id" :req.session.data._id},{ $pull : {requestin : req.body.id },$push : {friend : req.body.id}},function(err,result){
        if(err)
        throw err;
        else
        {
            person.updateOne({"_id" : req.body.id},{$pull : {requestout : req.session.data._id},$push : {friend : req.session.data._id}},function(err,result){
                if(err)
                throw err;
                else
                {
                    console.log('now they are friends')
                    res.send("now the are friends")
                }
            })
            
        }
    })
})

router.post('/getChats' , function(req,res){

    //     User.
    //   findOne({ name: 'Val' }).
    //   populate({
    //     path: 'friends',
    //     // Get friends of friends - populate the 'friends' array for every friend
    //     populate: { path: 'friends' }
    //   });
        
        person.findOne({"_id" : req.session.data._id}).
        populate({
            path : 'personchat' ,
            populate : { 
                path : 'members' ,select :{'username' : 1 ,'status' :1},
                // path : 'firstfriend' ,select :{'username' : 1},
                // path : 'secondfriend',select :{'username' : 1}
            }
            // populate : { path : 'firstfriend' ,select :{'username' : 1}},
        }).exec(function(err , result){
            if(err)
            throw err;
            else
            {
                console.log(result)
                res.send(result);
            }
        })  
})

router.post('/getChatHistory' , function(req,res){

    chatinstance.findOne({"_id" : req.body.chatid}).select('message').exec(function(err,result){
        if(err)
        throw err;
        else
        {
            console.log('send chat hostory')
            res.send(result)
        }
    })
       
})

router.post('/addchatToDb' , (req,res)=>{

    var chatid = req.body.chatid;
    var ob = {}
    ob.senderName = req.body.senderName
    ob.chat = req.body.chat
    chatinstance.updateOne({"_id" : chatid},{$push :{message  : ob}},function(err,result){
        if(err)
        throw err;
        else
        {
            console.log(result)
            res.send('chat added to db')
        }
    })
})


module.exports = router