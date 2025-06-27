import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
    employeeId: { type: String, required: false },
    Isverified: { type: Boolean, default: false },
    profilePicture: { type: String, default: null },

    },{ timestamps: true })

const User = mongoose.model("User", userSchema)
export default User