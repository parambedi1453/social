
if(process.env.NODE_ENV !=='production')
{
    require('dotenv').config()
}


var express = require('express')
var path = require('path')
var ejs = require('ejs')
var session = require('express-session')
var nodemailer = require('nodemailer')
var multer = require('multer')
var passport = require('passport')
var bodyParser = require('body-parser')
var app = express()
var mongoose = require('mongoose')
var server = require('http').createServer(app)
var io = require('socket.io').listen(server)

server.listen(3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(session({secret: "abc"}))

//var session = require('express-session');
//Acces static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/uploads')));

//Bodyparser
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(session({secret: "xYzUCAchitkara"}));


// const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL,{
    useNewUrlParser : true
})


mongoose.connection.on('error',(err) => {
    console.log('DB connection Error');
  })

  mongoose.connection.on('connected',(err) => {
    //  useNewUrlParser: true;
    console.log('DB connected');
  })



  app.get('/',function(req,res){
      res.render('loginpage')
  })
  
  app.post('/login',function(req,res){

        // console.log(req.body)
        person.findOne({username : req.body.username,password : req.body.password},function(err,data){
            if(err)
            throw err;
            else
            {
                // console.log(data);
                var sessionData = new Object();
                sessionData._id = data._id
                sessionData.username = data.username;
                sessionData.password = data.password
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

  app.get('/dashboard',function(req,res){
    //   console.log("(*************8")
    //   console.log(req.session.data)
      res.render('dashboard',{obj : req.session.data})
  })

app.post('/getFriends',function(req,res){

    // console.log(req.body)

    var query = [{path : 'friend',select : {'username' : 1}}]
    person.findOne({"_id" : req.session.data._id}).populate(query).exec(function(err,result){
        if(err)
        throw err;
        else
        res.send(result)
    })
})
app.post('/getChats' , function(req,res){

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
            path : 'members' ,select :{'username' : 1},
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
app.post('/addFriends',function(req,res){

    console.log(req.body)
    person.find({ $and : [{ '_id' : { $not : { $eq : req.session.data._id}}},{ '_id' :{ $nin : req.session.data.friend }},{ '_id' :{ $nin : req.session.data.requestin }},{ '_id' :{ $nin : req.session.data.requestout }}]}).exec(function(err,result){
        if(err)
        throw err;
        else
        res.send(result)
    })
    
})
app.post('/getRequests',function(req,res){
     
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
app.post('/sendRequest',function(req,res){

   
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
app.post('/acceptRequest' , function(req,res){

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

app.post('/addchatToDb' , (req,res)=>{

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

app.post('/getChatHistory' , function(req,res){

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

users = {}
io.sockets.on('connection' ,function(socket){

        socket.on('new user' , function(data,callback){
            if(data in users){
                callback(false)
            }else{
                callback(true)
                users[data] = socket
                
                // io.sockets.emit('usernames',nicknames)
               
            }
        })

        socket.on('send-message' , function(data,callback){

            console.log('IN SEND MESSG')
            console.log(data)
            if(data.recieverid in users)
            {
                //users[name].emit('wisper' ,{msg :msg,nick : socket.nickname})

                users[data.recieverid].emit('wisper' ,{msg :data.chat , senderName : data.senderName ,senderid : data.senderid})
                console.log('usrr is online and messg sent')
                callback('usrr is online and messg sent');
            }
            else
            {
                console.log('user is not online and mesg sent to chatDb')
                callback('user is not online and mesg sent to chatDb')
            }
        })

        // socket.on('disconnect',function(data){
        //             if(!socket.nickname) return;
        //             delete users[socket.nickname]
                   
        //         })
 })




//   app.listen(3000,()=> console.log('server is running'))

// users = {}

// io.sockets.on('connection' ,function(socket){

//     socket.on('new user' , function(data,callback){
//         if(data in users){
//             callback(false)
//         }else{
//             callback(true)
//             users[data] = socket.id
            
//             // io.sockets.emit('usernames',nicknames)
           
//         }
//     })
// })

//     socket.on('send message' , function(data,callback){

//         var msg = data.trim()
//         if(msg.substr(0,3) === '/w ')
//         {
//             msg = msg.substr(3);
//             var ind = msg.indexOf(' ')
//             if(ind != -1)
//             {
//                 var name = msg.substr(0,ind)
//                 var msg = msg.substr(ind+1)
//                 if(name in users)
//                 {
//                     users[name].emit('wisper' ,{msg :msg,nick : socket.nickname})
//                     console.log('wisper')
//                 }
//                 else{
//                     console.log('enter a valid name ')
//                 }
               
//             }
//             else{
//                 callback('please enter the messsg fot wispwr')
//             }
//         }
//         else{
//             io.sockets.emit('new message',{msg: data ,nick : socket.nickname})//will send message includoing me 
//         // io.socket.broadcast.emit('new message' , data)//will send to everyone elese me
//         }
        
//     })

//     socket.on('disconnect',function(data){
//         if(!socket.nickname) return;
//         delete users[socket.nickname]
//         updateNicknames();
//     })
//     function updateNicknames()
//     {
//       io.sockets.emit('usernames',Object.keys(users))

//     }
// })