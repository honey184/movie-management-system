const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true
        },

        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
        },

        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6
        },

        role: {
            type: String,
            default: 'user'
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);


// Hash password before saving
userSchema.pre('save', async function () {

    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 10);

});


// Compare password during login
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;