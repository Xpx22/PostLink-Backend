import { Schema, model } from "mongoose";
import moment from "moment";

const jobpostSchema = new Schema({
	creator: { type: Schema.Types.ObjectId, ref: "Employer", required: true },
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

export default model("JobPost", jobpostSchema);