import { Router } from "express";
import multer, { diskStorage } from "multer";

import authConfirm from "../middleware/auth-confirm";

const router = Router();

const cvstorage = diskStorage({
    destination: (_req, file, cb) => {
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


import { fetchUserData, modifyUserData, fetchUserBookmarks, addUserBookmark, deleteUserBookmark, fetchUserAppliedJobs, applyForJob, unapplyFromJob } from "../controllers/userController";

// users -----------------------------------------------------------------------------------
///-------------------------------------------account
router.get("/users/:id", authConfirm, fetchUserData);

router.put("/users/:id", authConfirm, multer({storage: cvstorage}).single("cvPath"), modifyUserData);
///-------------------------------------------account


///-------------------------------------------bookmarks
router.get("/users/:id/bookmarks", authConfirm, fetchUserBookmarks);

router.post("/users/:id/bookmarks/:pid", authConfirm, addUserBookmark);

router.delete("/users/:id/bookmarks/:pid", authConfirm, deleteUserBookmark);
///-------------------------------------------bookmarks

///-------------------------------------------dashboard
router.get("/users/:id/dashboard", authConfirm, fetchUserAppliedJobs);

router.post("/users/:id/dashboard/:pid", authConfirm, applyForJob);

router.delete("/users/:id/dashboard/:pid", authConfirm, unapplyFromJob);
///-------------------------------------------dashboard
// -----------------------------------------------------------------------------------------

export default router;