const {Schema, model} = require("mongoose")

const conceptSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,

    },
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
    selectedOperatoinl: {
        type: [Schema.Types.ObjectId],
        ref: "User",
    },

    description: {
        type: String,

    },
    aprovalCount: {
        type: [Boolean]

    },
    isAproved: {
        type: Boolean,
        default: false,
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