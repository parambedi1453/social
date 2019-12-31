var mongoose = require('mongoose')

var groupSchema = new mongoose.Schema({

    name : String,
    owner : [{type : mongoose.Schema.Types.ObjectId,ref :'persons'  }],
    members : [{type : mongoose.Schema.Types.ObjectId,ref :'persons'}],
    message : [],
    lastmodified : Number
})

const groupinstance = mongoose.model('groups',groupSchema)
module.exports = groupinstance