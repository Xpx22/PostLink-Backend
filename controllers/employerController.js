import { findById, updateOne, findByIdAndUpdate } from "../models/Employer";
import { updateMany, find, findOneAndUpdate, findByIdAndDelete } from "../models/Jobpost";
import { find as _find, updateOne as _updateOne } from "../models/JobApplication";

export async function fetchCompanyData(req, res) {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Unauthorized access to other employer's data."
        });
    }
    const employer = await findById(req.params.id).select("-password");
    if(!employer) {
        return res.status(404).json({
            message: "Employer does not exist."
        });
    }
    return res.status(200).json({
        employer: employer
    });
}

export async function modifyCompanyData(req, res) {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Unauthorized employer access!"
        });
    }
    
    let imgPath = req.body.logo;
    //multer single logo file
    if(req.file){
        const url = req.protocol + "://" + req.get("host");
        imgPath = url + "/images/" + req.file.filename;
    }

    const filter = {
        _id: req.params.id
    };
    const update = {
        companyName: req.body.companyName,
        logoPath: imgPath,
        phoneNumber: req.body.phoneNumber,
        website: req.body.website,
        city: req.body.city,
        country: req.body.country
    };
    const updatedEmployer = await updateOne(filter, update, {
        new: true
    });

    if(!updatedEmployer){
        return res.status(500).json({
            message: "Employer data update failed!"
        });
    }

    const filterJob = { creator: req.params.id };
    const updateJob = {
        companyName: req.body.companyName,
        logoPath: imgPath,
        phoneNumber: req.body.phoneNumber,
        website: req.body.website,
        city: req.body.city,
        country: req.body.country
    };

    const updatedJobPosts = await updateMany(filterJob, updateJob);
    if(!updatedJobPosts){
        return res.status(500).json({
            message: "Employer jobs data update failed!"
        });
    }

    return res.status(200).json({
        message: "Employer data updated successfully!"
    });
}


export async function fetchCompanyDashboard(req, res) {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Unauthorized employer posts access!"
        });
    }
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;

    let jobPostsOfEmployer = await findById(req.params.id)
        .populate("jobPosts");
    const allJobsCount = jobPostsOfEmployer.jobPosts.length;
    if(!jobPostsOfEmployer || !allJobsCount){
        return res.status(404).json({
            message: "no jobs found.",
            jobs: [],
            jobsCount: allJobsCount
        });
    }

    if(pageSize && currentPage){
        jobPostsOfEmployer = await find({creator: req.params.id})
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);
    }
    
    const appliedUserCountArray = [];
    for(let i = 0; i < jobPostsOfEmployer.length; i++){
        const appliedCount = await _find({ jobID: jobPostsOfEmployer[i]._id})
            .count();
        appliedUserCountArray.push(appliedCount);
    }

    const normalizedJobsWithAppliedUserCount = [];
    for(let i = 0; i < jobPostsOfEmployer.length; i++){
        normalizedJobsWithAppliedUserCount.push({
            _id: jobPostsOfEmployer[i]._id,
            creator: jobPostsOfEmployer[i].creator,
            companyName: jobPostsOfEmployer[i].companyName,
            logoPath: jobPostsOfEmployer[i].logoPath,
            phoneNumber: jobPostsOfEmployer[i].phoneNumber,
            website: jobPostsOfEmployer[i].website,
            email: jobPostsOfEmployer[i].email,
            city: jobPostsOfEmployer[i].city,	
            country: jobPostsOfEmployer[i].country,	
            description: jobPostsOfEmployer[i].description,
            requiredSkills: jobPostsOfEmployer[i].requiredSkills,
            goodToHaveSkills: jobPostsOfEmployer[i].goodToHaveSkills,
            dateUploaded: jobPostsOfEmployer[i].dateUploaded,
            positionName: jobPostsOfEmployer[i].positionName,
            homeOffice: jobPostsOfEmployer[i].homeOffice,
            salaryMin: jobPostsOfEmployer[i].salaryMin,
            salaryMax: jobPostsOfEmployer[i].salaryMax,
            appliedCount: appliedUserCountArray[i]
        });
    }
    return res.status(200).json({
        jobs: normalizedJobsWithAppliedUserCount,
        jobsCount: allJobsCount
    });
}

export async function editJob(req, res) {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Employer ID is invalid!"
        });
    }

    const jobFilter = {
        _id: req.params.pid,
        creator: req.params.id
    };
    const jobUpdate = {
        description: req.body.description,
        requiredSkills: req.body.requiredSkills,
        goodToHaveSkills: req.body.goodToHaveSkills,
        positionName: req.body.positionName,
        homeOffice: req.body.homeOffice,
        salaryMin: req.body.salaryMin,
        salaryMax: req.body.salaryMax
    };

    const updatedJob = await findOneAndUpdate(jobFilter, jobUpdate, {
        new: true
    });
    if(!updatedJob) {
        return res.status(500).json({
            message: "Job update failed!"
        });
    }
    return res.status(200).json({
        message: "Job updated successfully!"
    });
}

export async function deleteJob(req, res) {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Unauthorized employer access!"
        });
    }

    const empUpdate = {
        "$pull": {
            jobPosts: {
                _id: req.params.pid
            }
        }
    };

    const employer = await findByIdAndUpdate(req.params.id, empUpdate, {
        new: true
    });

    if(!employer) {
        return res.status(404).json({
            message: "employer not found!"
        });
    }

    const job = await findByIdAndDelete(req.params.pid);
    if(!job){
        return res.status(404).json({
            message: "job not found!"
        });
    }

    return res.status(200).json({
        message: "Job deleted successfully!"
    });
}


export async function fetchAppliedUsersOfAJob(req, res) {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Unauthorized access!"
        });
    }

    const filter1 = {
        jobID: req.params.pid,
        status: 0
    };
    const filter2 = {
        jobID: req.params.pid,
        status: 1
    };

    const appliedUsers = await _find({
            $or: [
                filter1,
                filter2
            ]   
        })
        .populate("userID", "-password -bookmarks")
        .select("userID status -_id");
    if(!appliedUsers){
        return res.status(404).json({
            message: "Applied users not found!"
        });
    }
    const users = [];
    for(let i = 0; i < appliedUsers.length; i++){
        const newApplied = {
            _id: appliedUsers[i].userID._id,
            fullname: appliedUsers[i].userID.fullname,
            phoneNumber: appliedUsers[i].userID.phoneNumber,
            email: appliedUsers[i].userID.email,
            cvPath: appliedUsers[i].userID.cvPath,
            status: appliedUsers[i].status
        };
        users.push(newApplied);
    }
    return res.status(200).json({
        users: users
    });
}

export async function acceptAppliedUser(req, res) {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Unauthorized access!"
        });
    }

    const filter = { 
        userID: req.params.uid,
        jobID: req.params.pid 
    };

    const update = {
        status: 1
    };

    const acceptUser = await _updateOne(filter, update, {
            new: true
        });
    if(!acceptUser){
        return res.status(404).json({
            message: "Accepting user failed"
        });
    }
    return res.status(200).json({
        message: "User accepted!"
    });
}

export async function declineAppliedUser(req, res) {
    if(req.endUserData.endUserID !== req.params.id){
        return res.status(401).json({
            message: "Unauthorized access!"
        });
    }

    const filter = { 
        userID: req.params.uid,
        jobID: req.params.pid 
    };

    const update = {
        status: -1
    };

    const acceptUser = await _updateOne(filter, update, {
            new: true
    });
    if(!acceptUser){
        return res.status(500).json({
            message: "Declining user failed"
        });
    }
    return res.status(200).json({
        message: "User declined!"
    });
}