const {Schema, model} = require("mongoose")

const conceptSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    selectedManagers: {
        type: [Schema.Types.ObjectId],
        ref: "User",
        required: true,
    },
    selectedOperatoin: {
        type: [Schema.Types.ObjectId],
        ref: "User",
    },

    description: {
        type: String,

    },
    status: {
        type: String,
        enum: ["not started", "in progress", "done"],
        default: "not started"
    }
}, {
    timestamps: true
})


const Concept = model("Concept",conceptSchema)

module.exports = Concept