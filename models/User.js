const {Schema, model} = require("mongoose")

const userSchema = new Schema({
    username: {
        type: String,
        required:[true,"Email is Required"],
        unique:true,
        lowercase:true,
        trim:true
    },
    hashedPassword:{
        type:String,
        required:[true,"Password is Required"]
    },
    role: {
        type: String,
        enum: ["admin", "manager", "employee"],
        // required: true
    },


    projects: [{
        type: [Schema.Types.ObjectId],
        ref: "Concept", 
        status: {
            type: String,
            enum: ["not started", "in progress", "done"],
        }
    }]

})

const User = model("User",userSchema)

module.exports = User