import { Schema, Types, model } from "mongoose";

const userSchema = new Schema({
    fullname: {type: String, default: ""},
	// dateOfBirth: Date,
	phoneNumber: {type: String, default: ""},
	email: {type: String, required: true, lowercase: true, unique: true},
	password: { type: String, required: true },
	// city: {type: String, default: ""},
	// country: {type: String, default: ""},
	// skills: [String],
	// homeOffice: Boolean,
	cvPath: {type: String, default: ""},
	// gender: Boolean,
	// appliedPosts: [jobApplicationSchema],
	bookmarks: [{ type: Types.ObjectId, ref: "JobPost"}]
})

// userSchema.plugin(uniqueValidator);

export default model("User", userSchema);