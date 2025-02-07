
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


// Routes 
const indexRouter = require('./routes/index')
const friendRouter = require('./routes/friend')

// using Routes
app.use('/',indexRouter)
app.use('/friends' , friendRouter)
  
 
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





users = {}
io.sockets.on('connection' ,function(socket){

        socket.on('new user' , function(data,callback){
            if(data in users){
                callback(false)
            }else{
                callback(true)
                // the data here is the mongo id of the user just enetrd
                users[data] = socket
                
                // io.sockets.emit('usernames',nicknames)
               
            }
        })
        socket.on('group-connected' , function(data,callback){
            if(data in users){
                callback(false)
            }else{
                callback(true)
                // the data here is the mongo id of the user just enetrd
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

        socket.on('disconnect', () => {
            console.log('user disconnected');
            
            function getKeyByValue(object, value) { 
            return Object.keys(object).find(key =>
                object[key] === value); 
            }

            ans = getKeyByValue(users, socket); 
            delete users[ans];
        })

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


// socket.on('disconnect', () => {
//     console.log('user disconnected');
//     function getKeyByValue(object, value) { 
//       return Object.keys(object).find(key =>
//         object[key] === value); 
//     }

//     ans = getKeyByValue(users, socket.id); 
//     users[ans] = "";

//   });