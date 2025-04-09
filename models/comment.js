const { Schema, model } = require("mongoose");

const commentSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    concept: {
        type: Schema.Types.ObjectId,
        ref: "Concept",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Comment = model("Comment", commentSchema);

module.exports = Comment;
