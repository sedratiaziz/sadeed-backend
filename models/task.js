const { Schema, model } = require("mongoose");

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["not started", "in progress", "completed"],
        default: "not started",
    },
    deadline: {
        type: Date,
        required: true,
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: "concept",
        required: true,
    },
}, { timestamps: true });

const Task = model("Task", taskSchema);

module.exports = Task;
