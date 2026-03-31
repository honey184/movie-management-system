const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, minlength: 6 },
        role: { type: String, default: 'admin' },
    },
    {
        versionKey: false
    }
);

adminSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};


const Admin = mongoose.model("Admin", adminSchema)

module.exports = Admin