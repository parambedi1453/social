var mongoose = require('mongoose')

var personSchema = new mongoose.Schema({

    username : String,
    email : String,
    password : String,
    dpimage : {type : String},
    status : String,
    joindate : String,
    phone : String,
    friend : [{type : mongoose.Schema.Types.ObjectId,ref :'persons'  }],
    requestin: [{type : mongoose.Schema.Types.ObjectId,ref :'persons'}],
    requestout: [{type : mongoose.Schema.Types.ObjectId,ref :'persons'}],
    personchat: [{type : mongoose.Schema.Types.ObjectId,ref:'chats'}],
    groupconnected : [{type : mongoose.Schema.Types.ObjectId , ref :'groups'}]
})
const person = mongoose.model('persons',personSchema)
module.exports = person;