const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const customUserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    registrationTime: {
        type: Date,
        default: Date.now,
    },
    loginTime: {
        type: Date,
    }
});

// Hash the password before saving the user
customUserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to compare password for login
customUserSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Method to generate JWT token
customUserSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
};

const CustomUser = mongoose.model('CustomUser', customUserSchema);

module.exports = CustomUser;
