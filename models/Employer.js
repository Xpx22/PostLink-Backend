import { Schema, Types, model } from "mongoose";

const employerSchema = Schema({
    companyName: {type: String, default: ""},
	logoPath: {type: String, default: ""},
	phoneNumber: {type: String, default: ""},
	email: {type: String, required: true, lowercase: true, unique: true},
	password: {type: String, required: true},
	website: {type: String, default: ""},
	city: {type: String, default: ""},
	country: {type: String, default: ""},
	jobPosts: [{type: Types.ObjectId, ref: "JobPost"}], //array of objectIDs of jobposts
	bookmarks: [{type: Types.ObjectId, ref: "User"}]
})

// mongoose.plugin(uniqueValidator);
export default model("Employer", employerSchema);