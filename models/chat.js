var mongoose = require('mongoose')


var chatSchema = new mongoose.Schema({
    // firstfriend : [{type : mongoose.Schema.Types.ObjectId , ref :'persons'}],
    // secondfriend : [{type : mongoose.Schema.Types.ObjectId,ref :'persons'}],
    members : [{type : mongoose.Schema.Types.ObjectId,ref :'persons'}],
    message : [],
    lastmodified : Number
})

const chatinstance  = mongoose.model('chats',chatSchema) 
module.exports = chatinstance