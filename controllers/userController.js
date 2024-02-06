import { Types } from "mongoose";

import { findById, updateOne, find } from "../models/User";
import JobApplication, { find as _find, deleteOne } from "../models/JobApplication";

export async function fetchUserData(req, res) {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Unauthorized access to other user's data."
        });
    }
    const user = await findById(req.params.id).select("-password");
    if(!user) {
        return res.status(404).json({
            message: "User does not exist."
        });
    }
    return res.status(200).json({
        user: user
    });
}

export async function modifyUserData(req, res) {
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
    const updatedUser = await updateOne(filter, update, {
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

export async function fetchUserBookmarks(req, res) {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Unauthorized user bookmark access!"
        });
    }
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;

    let jobPostsOfUser = await findById(req.params.id)
        .select("bookmarks -_id")
        .populate("bookmarks");
    const allJobsCount = jobPostsOfUser.bookmarks.length;

    if(pageSize && currentPage){
        jobPostsOfUser = await find(
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

export async function addUserBookmark(req, res) {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Unauthorized user bookmark process!"
        });
    }

    const isBookmarkExistForUser = await find({
            _id: req.params.id,
            "bookmarks": {
                $in: [Types.ObjectId(req.params.pid)]
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
    
    const user = await updateOne(filter, update);
    if(!user){
        return res.status(500).json({
            message: "Adding bookmark to user failed!"
        });
    }

    return res.status(201).json({
        message: "Added new bookmark to user!"
    });
}

export async function deleteUserBookmark(req, res) {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Unauthorized user bookmark process!"
        });
    }

    const isBookmarkExistForUser = await find({
            _id: req.params.id,
            "bookmarks": {
                $in: [Types.ObjectId(req.params.pid)]
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
    
    const user = await updateOne(filter, update);
    if(!user){
        return res.status(500).json({
            message: "Removing bookmark from user failed!"
        });
    }

    return res.status(200).json({
        message: "Removed bookmark from user!"
    });
}


export async function fetchUserAppliedJobs(req, res) {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Unauthorized user dashboard access!"
        });
    }
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;

    let userAppliedJobs = await _find({ userID: req.params.id })
        .select("jobID -_id")
        .populate("jobID");
    if(!userAppliedJobs){
        return res.json({
            message: "User has not applied for jobs!"
        });
    }
    const allJobsCount = userAppliedJobs.length;
    if(pageSize && currentPage){
        userAppliedJobs = await _find({ userID: req.params.id})
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


export async function applyForJob(req, res) {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Unauthorized user job application process!"
        });
    }

    const hasCV = await findById(req.params.id);
    if(!hasCV.cvPath){
        return res.json({
            message: "Please upload a cv first!"
        });
    }

    const alreadyApplied = await _find({
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


export async function unapplyFromJob(req, res) {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Unauthorized user unapplication process!"
        });
    }

    const alreadyApplied = await _find({
        userID: req.params.id,
        jobID: req.params.pid
    });
    if(alreadyApplied.length < 1){
        return res.json({
            message: "Job application does not exist!"
        });
    }
    
    const result = await deleteOne({
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

