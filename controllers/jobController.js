const JobPost = require("../models/Jobpost");
const Employer = require('../models/Employer');

exports.fetchAllJobs =  async (req, res) => {
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    const positionParam = req.query.position;
    const companyParam = req.query.company;
    
    let city = "";
    let country = "";
    if(req.query.location.includes(",")){
        const locations = req.query.location.split(",");
        city = locations[0].trim();
        country = locations[1].trim();
    }

    let jobPosts;
    let numOfAllJobs;
    const sortby = req.query.sortby;
    
    if(pageSize && currentPage){
        numOfAllJobs = await JobPost.find({
            positionName: {
                "$regex": positionParam,
                "$options": "i"
            },
            companyName: {
                "$regex": companyParam,
                "$options": "i"
            },
            city: {
                "$regex": city,
                "$options": "i"
            },
            country: {
                "$regex": country,
                "$options": "i"
            }
        }).count();
        if(numOfAllJobs === 0){
            return res.status(200).json({
                jobs: [],
                jobsCount: numOfAllJobs
            });
        }

        switch(sortby){
            case "dateAsc":
                jobPosts = await JobPost.find({
                    positionName: {"$regex": positionParam,"$options": "i"},
                    companyName: {"$regex": companyParam,"$options": "i"},
                    city: {"$regex": city,"$options": "i"},
                    country: {"$regex": country,"$options": "i"}
                })
                .sort("dateUploaded")
                .skip(pageSize * (currentPage - 1))
                .limit(pageSize);
                break;
            case "dateDes":
                jobPosts = await JobPost.find({
                    positionName: {"$regex": positionParam,"$options": "i"},
                    companyName: {"$regex": companyParam,"$options": "i"},
                    city: {"$regex": city,"$options": "i"},
                    country: {"$regex": country,"$options": "i"}
                })
                .sort("-dateUploaded")
                .skip(pageSize * (currentPage - 1))
                .limit(pageSize);
                break;
            case "minAsc":
                jobPosts = await JobPost.find({
                    positionName: {"$regex": positionParam,"$options": "i"},
                    companyName: {"$regex": companyParam,"$options": "i"},
                    city: {"$regex": city,"$options": "i"},
                    country: {"$regex": country,"$options": "i"}
                })
                .sort("salaryMin")
                .skip(pageSize * (currentPage - 1))
                .limit(pageSize);
                break;
            case "minDes":
                jobPosts = await JobPost.find({
                    positionName: {"$regex": positionParam,"$options": "i"},
                    companyName: {"$regex": companyParam,"$options": "i"},
                    city: {"$regex": city,"$options": "i"},
                    country: {"$regex": country,"$options": "i"}
                })
                .sort("-salaryMin")
                .skip(pageSize * (currentPage - 1))
                .limit(pageSize);
                break;
            case "maxAsc":
                jobPosts = await JobPost.find({
                    positionName: {"$regex": positionParam,"$options": "i"},
                    companyName: {"$regex": companyParam,"$options": "i"},
                    city: {"$regex": city,"$options": "i"},
                    country: {"$regex": country,"$options": "i"}
                })
                .sort("salaryMax")
                .skip(pageSize * (currentPage - 1))
                .limit(pageSize);
                break;
            case "maxDes":
                jobPosts = await JobPost.find({
                    positionName: {"$regex": positionParam,"$options": "i"},
                    companyName: {"$regex": companyParam,"$options": "i"},
                    city: {"$regex": city,"$options": "i"},
                    country: {"$regex": country,"$options": "i"}
                })
                .sort("-salaryMax")
                .skip(pageSize * (currentPage - 1))
                .limit(pageSize);
                break;
            default: 
                jobPosts = await JobPost.find({
                    positionName: {"$regex": positionParam,"$options": "i"},
                    companyName: {"$regex": companyParam,"$options": "i"},
                    city: {"$regex": city,"$options": "i"},
                    country: {"$regex": country,"$options": "i"}
                })
                .skip(pageSize * (currentPage - 1))
                .limit(pageSize);
                break;
        }

        if(!jobPosts){
            return res.status(404).json({
                message: "no posts found."
            })
        }
 
        return res.status(200).json({
            jobs: jobPosts,
            jobsCount: numOfAllJobs
        });
    }
}

exports.postAJob = async (req, res) => {
    if(!(
        req.body.job.positionName &&
        req.body.job.salaryMin &&
        req.body.job.salaryMax
    )){
        return res.status(400).send({ message: "Missing Data." });
    }
    //auth confirm test
    // const creatorID = req.employerData.employerID;
    const creatorID = req.endUserData.endUserID;
    if(!creatorID){
        return res.status(500).send({ message: "Error in creator ID" });
    }
    const employer = await Employer.findOne({_id: creatorID});
    if(!employer){
        return res.status(500).send({ message: "Error in finding employer" });
    }

    const newPost = new JobPost({
        creator: creatorID,
        companyName: employer.companyName,
        logoPath: employer.logoPath,
        phoneNumber: employer.phoneNumber,
        website: employer.website,
        email: employer.email,
        city: employer.city,
        country: employer.country,
        description: req.body.job.description,
        requiredSkills: req.body.job.requiredSkills,
        goodToHaveSkills: req.body.job.goodToHaveSkills,
        positionName: req.body.job.positionName,
        homeOffice: req.body.job.homeOffice,
        salaryMin: req.body.job.salaryMin,
        salaryMax: req.body.job.salaryMax,
        appliedUser: []
    });
    const result = await newPost.save();
    if(!result){
        return res.status(500).send({ message: "Error in saving job post." });
    }
    const newPostForEmployer = await employer.jobPosts.push(newPost);
    if(!newPostForEmployer){
        return res.status(500).send({ message: "Error in saving job post for employer." });
    }
    const saveEmployer = await employer.save();
    if(!saveEmployer){
        return res.status(500).send({ message: "Error in saving employer with new job." });
    }
    return res.status(201).json({ message: "Job created successfully!" });
}

exports.fetchAJob = async (req, res)=>{
    try{
        const job = await JobPost.findById(req.params.id);
        if(!job){
            return res.status(404).json({
                message: "Job not found! code: " + res.statusCode,
                job: undefined
            });
        }
        return res.status(200).json({
            job: job,
            message: "Success! code: " + res.statusCode
        });

    }catch(err){
        return res.status(500).json({
            message: "Job not found! code: " + res.statusCode,
            job: undefined
        });
    }
}
