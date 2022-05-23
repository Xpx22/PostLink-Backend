const express = require("express");
const router = express.Router();
const multer = require("multer");

const authConfirm = require("../middleware/auth-confirm");
const imgstorage = multer.diskStorage({
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

const employerController = require("../controllers/employerController");


// employers ---------------------------------------------------------------------------------
///-------------------------------------------account
router.get("/employers/:id", authConfirm, employerController.fetchCompanyData);

router.put("/employers/:id", authConfirm, multer({storage: imgstorage}).single("logo"), employerController.modifyCompanyData);
///-------------------------------------------account

///-------------------------------------------dashboard
router.get("/employers/:id/dashboard", authConfirm, employerController.fetchCompanyDashboard);
///-------------------------------------------dashboard

///-------------------------------------------job edit
router.put("/employers/:id/dashboard/:pid", authConfirm, employerController.editJob);
///-------------------------------------------job edit

///-------------------------------------------job delete
router.delete("/employers/:id/dashboard/:pid", authConfirm, employerController.deleteJob);
///-------------------------------------------job delete


///------------------------------------------- fetch applied users
router.get("/employers/:id/users/:pid", authConfirm, employerController.fetchAppliedUsersOfAJob);

///------------------------------------------- fetch applied users


///------------------------------------------- accept applied user
router.put("/employers/:id/users/:uid/posts/:pid/accept", authConfirm, employerController.acceptAppliedUser);
///------------------------------------------- accept applied user


///------------------------------------------- decline applied user
router.put("/employers/:id/users/:uid/posts/:pid/decline", authConfirm, employerController.declineAppliedUser);
///------------------------------------------- decline applied user
// -----------------------------------------------------------------------------------------

module.exports = router;