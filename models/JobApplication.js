import { Schema, model } from "mongoose";

const jobApplicationSchema = new Schema({
	userID: { type: Schema.Types.ObjectId, ref: "User" },
    jobID: { type: Schema.Types.ObjectId, ref: "JobPost" },
    status: { type: Number, default: 0 }
});

export default model("JobApplication", jobApplicationSchema);