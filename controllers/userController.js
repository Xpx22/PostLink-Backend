const mongoose = require("mongoose");

const User = require("../models/User");
const JobApplication = require("../models/JobApplication");

exports.fetchUserData = async (req, res) => {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Unauthorized access to other user's data."
        });
    }
    const user = await User.findById(req.params.id).select("-password");
    if(!user) {
        return res.status(404).json({
            message: "User does not exist."
        });
    }
    return res.status(200).json({
        user: user
    });
}

exports.modifyUserData = async (req, res) => {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Unauthorized user access!"
        });
    }
    
    let cvPath = req.body.cvPath;
    //multer single cv file
    if(req.file){
        const url = req.protocol + "://" + req.get("host");
        cvPath = url + "/cvs/" + req.file.filename;
    }

    const filter = {
        _id: req.params.id
    };
    const update = {
        fullname: req.body.fullname,
        phoneNumber: req.body.phoneNumber,
        cvPath: cvPath
    };
    const updatedUser = await User.updateOne(filter, update, {
        new: true
    });

    if(!updatedUser){
        return res.status(500).json({
            message: "User data update failed!"
        });
    }

    return res.status(200).json({
        message: "User data updated successfully!"
    });
}

exports.fetchUserBookmarks = async (req, res) => {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Unauthorized user bookmark access!"
        });
    }
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;

    let jobPostsOfUser = await User
        .findById(req.params.id)
        .select("bookmarks -_id")
        .populate("bookmarks");
    const allJobsCount = jobPostsOfUser.bookmarks.length;

    if(pageSize && currentPage){
        jobPostsOfUser = await User
            .find(
                { _id: req.params.id},
                { bookmarks: {
                    $slice: [pageSize * (currentPage - 1), pageSize]
                }
            })
            .populate("bookmarks");

        // jobPostsOfUser = await User
        //     .findById(req.params.id)
        //     .slice("bookmarks", [pageSize * (currentPage - 1), pageSize])
        //     .populate("bookmarks");
        //console.log(jobPostsOfUser);
    }
    return res.status(200).json({
        jobs: jobPostsOfUser[0].bookmarks,
        jobsCount: allJobsCount
    });
}

exports.addUserBookmark = async (req, res) => {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Unauthorized user bookmark process!"
        });
    }

    const isBookmarkExistForUser = await User
        .find({
            _id: req.params.id,
            "bookmarks": {
                $in: [mongoose.Types.ObjectId(req.params.pid)]
            }
        });
    if(isBookmarkExistForUser.length > 0){
        return res.json({
            message: "Bookmark already exists!"
        });
    }

    const filter = {
        _id: req.params.id
    };
    const update = {
        $push: {
            bookmarks: req.params.pid
        }
    };
    
    const user = await User
        .updateOne(filter, update);
    if(!user){
        return res.status(500).json({
            message: "Adding bookmark to user failed!"
        });
    }

    return res.status(201).json({
        message: "Added new bookmark to user!"
    });
}

exports.deleteUserBookmark = async (req, res) => {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Unauthorized user bookmark process!"
        });
    }

    const isBookmarkExistForUser = await User
        .find({
            _id: req.params.id,
            "bookmarks": {
                $in: [mongoose.Types.ObjectId(req.params.pid)]
            }
        });
    if(isBookmarkExistForUser.length < 1){
        return res.json({
            message: "Bookmark does not exist!"
        });
    }

    const filter = {
        _id: req.params.id
    };
    const update = {
        $pull: {
            bookmarks: req.params.pid
        }
    };
    
    const user = await User
        .updateOne(filter, update);
    if(!user){
        return res.status(500).json({
            message: "Removing bookmark from user failed!"
        });
    }

    return res.status(200).json({
        message: "Removed bookmark from user!"
    });
}


exports.fetchUserAppliedJobs = async (req, res) => {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Unauthorized user dashboard access!"
        });
    }
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;

    let userAppliedJobs = await JobApplication
        .find({ userID: req.params.id })
        .select("jobID -_id")
        .populate("jobID");
    if(!userAppliedJobs){
        return res.json({
            message: "User has not applied for jobs!"
        });
    }
    const allJobsCount = userAppliedJobs.length;
    if(pageSize && currentPage){
        userAppliedJobs = await JobApplication
            .find({ userID: req.params.id})
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize)
            .select("jobID -_id")
            .populate("jobID status");
        if(!userAppliedJobs){
            return res.status(404).json({
                message: "No jobs found.",
                jobs: [],
                jobsCount: allJobsCount
            });
        }
    }
    const normalizedJobsWithStatuses = [];
    for(let i = 0; i < userAppliedJobs.length; i++){
        normalizedJobsWithStatuses.push({
            job: userAppliedJobs[i].jobID,
            status: userAppliedJobs[i].status
        });
    }

    return res.status(200).json({
        jobs: normalizedJobsWithStatuses,
        jobsCount: allJobsCount
    });
}


exports.applyForJob = async (req, res) => {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Unauthorized user job application process!"
        });
    }

    const hasCV = await User.findById(req.params.id);
    if(!hasCV.cvPath){
        return res.json({
            message: "Please upload a cv first!"
        });
    }

    const alreadyApplied = await JobApplication.find({
        userID: req.params.id,
        jobID: req.params.pid
    });
    if(alreadyApplied.length > 0){
        return res.json({
            message: "User already applied for the job!"
        });
    }

    const applyUser = new JobApplication({
        userID: req.params.id,
        jobID: req.params.pid,
        status: 0
    });

    const result = await applyUser.save();
    if(!result){
        return res.status(500).json({
            message: "Applying for job failed!"
        });
    }

    return res.status(201).json({
        message: "Applied successfully!"
    });
}


exports.unapplyFromJob = async (req, res) => {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Unauthorized user unapplication process!"
        });
    }

    const alreadyApplied = await JobApplication.find({
        userID: req.params.id,
        jobID: req.params.pid
    });
    if(alreadyApplied.length < 1){
        return res.json({
            message: "Job application does not exist!"
        });
    }
    
    const result = await JobApplication
        .deleteOne({
            userID: req.params.id,
            jobID: req.params.pid
        });
    if(!result){
        return res.status(500).json({
            message: "Removing job application from user failed!"
        });
    }

    return res.status(200).json({
        message: "Unapplied successfully!"
    });
}

