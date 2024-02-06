import { Router } from "express";
const router = Router();
import multer, { diskStorage } from "multer";

import authConfirm from "../middleware/auth-confirm";
const imgstorage = diskStorage({
    destination: (req, file, cb) => {
        let error = new Error("File type error!");
        if(file.mimetype.toLowerCase().includes("image")){
            error = null;
        }
        cb(error, "images");
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(" ").join("-");
        const filenameWithExtension = Date.now() + "-" + name + "." + file.mimetype.split("/")[1];
        cb(null, filenameWithExtension);
    },
});

import { fetchCompanyData, modifyCompanyData, fetchCompanyDashboard, editJob, deleteJob, fetchAppliedUsersOfAJob, acceptAppliedUser, declineAppliedUser } from "../controllers/employerController";


// employers ---------------------------------------------------------------------------------
///-------------------------------------------account
router.get("/employers/:id", authConfirm, fetchCompanyData);

router.put("/employers/:id", authConfirm, multer({storage: imgstorage}).single("logo"), modifyCompanyData);
///-------------------------------------------account

///-------------------------------------------dashboard
router.get("/employers/:id/dashboard", authConfirm, fetchCompanyDashboard);
///-------------------------------------------dashboard

///-------------------------------------------job edit
router.put("/employers/:id/dashboard/:pid", authConfirm, editJob);
///-------------------------------------------job edit

///-------------------------------------------job delete
router.delete("/employers/:id/dashboard/:pid", authConfirm, deleteJob);
///-------------------------------------------job delete


///------------------------------------------- fetch applied users
router.get("/employers/:id/users/:pid", authConfirm, fetchAppliedUsersOfAJob);

///------------------------------------------- fetch applied users


///------------------------------------------- accept applied user
router.put("/employers/:id/users/:uid/posts/:pid/accept", authConfirm, acceptAppliedUser);
///------------------------------------------- accept applied user


///------------------------------------------- decline applied user
router.put("/employers/:id/users/:uid/posts/:pid/decline", authConfirm, declineAppliedUser);
///------------------------------------------- decline applied user
// -----------------------------------------------------------------------------------------

export default router;