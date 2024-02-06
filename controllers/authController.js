require("dotenv").config();
import { hash, compare } from "bcrypt";
import { sign } from "jsonwebtoken";

import User, { findOne } from "../models/User";
import Employer, { findOne as _findOne } from "../models/Employer";


export async function signUp(req, res){
    if(!(req.body.email && req.body.password)){
        return res.status(400).send({ err: "Invalid Email or Password!" });
    }
    const isEmployer = req.body.isEmployer;
    if(req.body.isEmployer === undefined){
        return res.status(400).json({
            message: "Form data has been tempered!"
        });
    }

    const user = await findOne({email: req.body.email});
    const employer = await _findOne({email: req.body.email});
    if(user || employer) return res.status(400).json({
        message: "Registration already exists!"
    });

    const hashedPW = await hash(req.body.password, 10);
    if(!hashedPW){
        return res.status(500).json({
            message: "Password hashing failed!"
        });
    }

    if(isEmployer){
        //handling employer sign up
        const newEmployer = new Employer({
            email: req.body.email,
            password: hashedPW
        });
        const resultEmployer = await newEmployer.save();
        if(!resultEmployer){
            return res.status(500).json({
                message: "Database failed or employer already exists!"
            });
        }
        return res.status(201).json({
            message: "Employer sign up successful!"
        });
    }
    //handling user sign up
    const newUser = new User({
        email: req.body.email,
        password: hashedPW
    });
    const resultUser = await newUser.save();
    if(!resultUser){
        return res.status(500).json({
            message: "Database failed or user already exists!"
        });
    }
    return res.status(201).json({
        message: "User sign up successful!"
    });
}

export async function signIn(req, res){
    if(!(req.body.email && req.body.password)){
        return res.status(400).send({
            err: "Invalid Email or Password!"
        });
    }
    //if it is employer
    const isEmployer = req.body.isEmployer;
    if(isEmployer){
        const employer = await _findOne({ email: req.body.email });
        if(!employer){
            return res.status(404).json({ 
                message: "Employer email address not found!",
                token: "",
                expirationTime: 0,
                user: undefined,
                employer: undefined
            });
        }
        const isValidPW = await compare(req.body.password, employer.password);
        if(!isValidPW) {
            return res.status(401).json({ 
                message: "Invalid Password.",
                token: "",
                expirationTime: 0,
                user: undefined,
                employer: undefined 
            });
        }
        // const token = jwt.sign({email: employer.email, employerID: employer._id}, "secret", {
        //     expiresIn: "1h"
        // });
        const token = sign({email: employer.email, endUserID: employer._id}, "secret", {
            expiresIn: "1h"
        });
        return res.status(200).json({ 
            message: "Successful employer authentication!", 
            token: token, 
            expirationTime: 3600,
            employer: employer,
            user: undefined
        });
    }

    //if it is user
    const user = await findOne({ email: req.body.email});
    if(!user){
        return res.status(404).json({ 
            message: "User email address not found!", 
            token: "",
            expirationTime: 0,
            user: undefined,
            employer: undefined
        });
    }
    
    const isValidPW = await compare(req.body.password, user.password);
    if(!isValidPW) {
        return res.status(401).json({ 
            message: "Invalid Password.", 
            token: "",
            expirationTime: 0,
            user: undefined,
            employer: undefined
        });
    }
    // const token = jwt.sign({email: user.email, userID: user._id}, process.env.JWT_TOKEN_SECRET, {
    //     expiresIn: "1h"
    // });
    const token = sign({email: user.email, endUserID: user._id}, process.env.JWT_TOKEN_SECRET, {
        expiresIn: "1h"
    });
    return res.status(200).json({ 
        message: "Successful user authentication!", 
        token: token, 
        expirationTime: 3600,
        user: user,
        employer: undefined
     });
}