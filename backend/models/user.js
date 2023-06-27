const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: [true, 'username already exists']},
    email:{type: String, required: true},
    password: {type: String, required: true},
    sales:[{type: mongoose.Schema.Types.ObjectId, ref: 'Sale'}],  
})

const User = mongoose.model('User', userSchema);
module.exports = User;