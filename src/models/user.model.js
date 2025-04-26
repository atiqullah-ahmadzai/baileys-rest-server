const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    jid: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        default: null
    },
    profileUrl: {
        type: String,
        default: null
    },
    profilePath: {
        type: String,
        default: null
    },
    isGroup: {
        type: Boolean,
        default: false
    },
    groupMetadata:
    {
        type: Object,
        default: {}  
    },
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
