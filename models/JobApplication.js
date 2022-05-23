const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema({
	userID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    jobID: { type: mongoose.Schema.Types.ObjectId, ref: "JobPost" },
    status: { type: Number, default: 0 }
});

module.exports = mongoose.model("JobApplication", jobApplicationSchema);