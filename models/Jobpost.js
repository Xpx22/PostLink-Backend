const mongoose = require("mongoose");
const moment = require("moment");

const jobpostSchema = new mongoose.Schema({
	creator: { type: mongoose.Schema.Types.ObjectId, ref: "Employer", required: true },
	companyName: String,
	logoPath: String,
	phoneNumber: String,
	website: String,
	email: String,
	city: String,
	country: String,	
	description: String,
    requiredSkills: [String],
    goodToHaveSkills: [String],
	dateUploaded: {type: Date, immutable: true, default: moment().local()},
	positionName: String,
	homeOffice: Boolean,
	salaryMin: Number,
	salaryMax: Number
})

module.exports = mongoose.model("JobPost", jobpostSchema);