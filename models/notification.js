const { Schema, model } = require("mongoose");

const notificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    conceptId: {
        type: Schema.Types.ObjectId,
        ref: "Concept",
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Notification = model("Notification", notificationSchema);

module.exports = Notification;
