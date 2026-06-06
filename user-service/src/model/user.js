const mongoose = require("mongoose");
const argon2 = require("argon2");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },

    password: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});


// Hash password before saving ie whenever a user is saved/modofoed its password its get atomaticaly hashed and svaed in db , hahs ppassswprd in registyer controller, then on updateing ,modifiying we will have  to again hash the password in that con troller so its  better to veate  a function in model itslef so that shama automatically hashed and saves the passseord in each user modification/creation

userSchema.pre("save", async function() {
    try {
        // Only hash if password modified
        if (!this.isModified("password")) {
            return;
        }
        this.password = await argon2.hash(this.password);
    } catch (error) {
        return;
    }
});


// Compare password method  // methods bulid custom function for schema, it is also used here so that we dont have  to write compare password logic again and again in diff routes , we can directly use this custom schemafunction to comapre password
userSchema.methods.comparePassword = async function(userPassword) {
    try {
        return await argon2.verify(this.password, userPassword);
    } catch (error) {
        throw error;
    }
};


// Text index
userSchema.index({ username: "text" });


// Model
const User = mongoose.model("User", userSchema);

module.exports = User;