const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 3000;
const cors = require("cors");
const mongoose = require("mongoose");
const apiVersion = "/v1";

mongoose.connect("mongodb://localhost/postlinkdb")
.then(()=>{
    console.log("connected to database!");
}).catch((e)=>{
    console.log("connection failed!");
    console.error(e)
});

app.use(cors({
    origin: ["http://localhost:4200"]
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//allowed to enter /images folder
app.use("/images", express.static("images"));
//allowed to enter /cvs folder
app.use("/cvs", express.static("cvs"));

//for debugging only
const User = require("./models/User");
const Employer = require("./models/Employer");
const JobPost = require("./models/Jobpost");
const JobApplication = require("./models/JobApplication");

app.use("/clearall", async (req, res)=>{
    await User.deleteMany({});
    await Employer.deleteMany({});
    await JobPost.deleteMany({});
    await JobApplication.deleteMany({});
    res.status(200).json({
        message: "cleared all"
    });
});
app.use("/getall", async (req, res)=>{
    const users = await User.find({});
    const employers = await Employer.find({});
    const jobs = await JobPost.find({});
    res.status(200).json({
        users: users,
        employers, employers,
        jobs: jobs
    });
});
// ----------------- TEST -----------------
const swaggerRoutes = require("./routes/swaggerRoutes");
swaggerRoutes(app);
//-----------------------------------------


const jobPostRoutesRouter = require("./routes/jobpostRoutes");
const authRoutesRouter = require("./routes/authRoutes");
const employerRoutesRouter = require("./routes/employerRoutes");
const userRoutesRouter = require("./routes/userRoutes");
app.use(apiVersion, jobPostRoutesRouter);
app.use(apiVersion, authRoutesRouter);
app.use(apiVersion, employerRoutesRouter);
app.use(apiVersion, userRoutesRouter);



app.listen(port, () => console.log(`server listening on port: ${port}`));