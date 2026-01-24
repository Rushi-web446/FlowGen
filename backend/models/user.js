const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    auth0Id: {
        type: String, // To link with Auth0 user
        unique: true,
        sparse: true, // Allows null/undefined values to not violate uniqueness for legacy users
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }
    ]
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;
