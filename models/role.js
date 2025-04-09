const { Schema, model } = require("mongoose");

const roleSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    permissions: [{
        type: String,
        enum: ["create", "read", "update", "delete"],
    }],
});

const Role = model("Role", roleSchema);

module.exports = Role;
