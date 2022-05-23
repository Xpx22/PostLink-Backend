const express = require("express");
const router = express.Router();
const multer = require("multer");

const authConfirm = require("../middleware/auth-confirm");


const cvstorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let error = new Error("File type error!");
        if(file.mimetype.toLowerCase().includes("pdf")){
            error = null;
        }
        cb(error, "cvs");
    },
    filename: (req, file, cb) => {
        const filenameWithExtension = file.originalname.toLowerCase();
        cb(null, filenameWithExtension);
    },
});


const userController = require("../controllers/userController");

// users -----------------------------------------------------------------------------------
///-------------------------------------------account
router.get("/users/:id", authConfirm, userController.fetchUserData);

router.put("/users/:id", authConfirm, multer({storage: cvstorage}).single("cvPath"), userController.modifyUserData);
///-------------------------------------------account


///-------------------------------------------bookmarks
router.get("/users/:id/bookmarks", authConfirm, userController.fetchUserBookmarks);

router.post("/users/:id/bookmarks/:pid", authConfirm, userController.addUserBookmark);

router.delete("/users/:id/bookmarks/:pid", authConfirm, userController.deleteUserBookmark);
///-------------------------------------------bookmarks

///-------------------------------------------dashboard
router.get("/users/:id/dashboard", authConfirm, userController.fetchUserAppliedJobs);

router.post("/users/:id/dashboard/:pid", authConfirm, userController.applyForJob);

router.delete("/users/:id/dashboard/:pid", authConfirm, userController.unapplyFromJob);
///-------------------------------------------dashboard
// -----------------------------------------------------------------------------------------

module.exports = router;