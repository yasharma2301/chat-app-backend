import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'

const userModel = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        pic: { type: String, default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg", },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    { timestamps: true }
);

userModel.methods.matchPassword = async function (suppliedPassword) {
    return await bcrypt.compare(suppliedPassword, this.password)
}

// pre-save hook runs just before data is saved to DB
userModel.pre('save', async function (next) {

    // If the object is not modified again, skip the process of hashing
    if (!this.isModified()) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

const User = mongoose.model('User', userModel);
export default User;