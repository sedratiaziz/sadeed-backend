const { Schema, model } = require("mongoose");

const teamSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }],
    projects: [{
        type: Schema.Types.ObjectId,
        ref: "Project",
    }],
}, { timestamps: true });

const Team = model("Team", teamSchema);

module.exports = Team;
