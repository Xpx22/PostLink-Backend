const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const employerSchema = mongoose.Schema({
    companyName: {type: String, default: ""},
	logoPath: {type: String, default: ""},
	phoneNumber: {type: String, default: ""},
	email: {type: String, required: true, lowercase: true, unique: true},
	password: {type: String, required: true},
	website: {type: String, default: ""},
	city: {type: String, default: ""},
	country: {type: String, default: ""},
	jobPosts: [{type: mongoose.Types.ObjectId, ref: "JobPost"}], //array of objectIDs of jobposts
	bookmarks: [{type: mongoose.Types.ObjectId, ref: "User"}]
})

// mongoose.plugin(uniqueValidator);
module.exports = mongoose.model("Employer", employerSchema);