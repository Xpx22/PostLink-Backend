const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const JobPost = require("../models/Jobpost");
const User = require("../models/User");
const Employer = require('../models/Employer');
const authConfirm = require("../middleware/auth-confirm");


const jobController = require("../controllers/jobController");

router.get("/posts", jobController.fetchAllJobs);

router.post("/posts", authConfirm, jobController.postAJob);

router.get("/posts/:id", jobController.fetchAJob);


//debugging ----------------------------------------------------------------------------------------------------
router.get("/genposts", async (req, res) => {
    const companyNames = ["Oracle Corporation", "Microsoft Corporation", "Google Incorporated", "Twitter Incorporated", "Facebook Incorporated"];
    let companyLogo = ["oracle.jpg", "Microsoft.jpg", "google.png", "twitter.png", "facebook.png"];
    for(let i = 0; i < 5; i++){
        companyLogo[i] = "http://localhost:3000/images/"+companyLogo[i];
    }
    
    const cities = [
        "Budapest",
        "Berlin",
        "Zürich",
        "Paris",
        "Madrid"
    ];
    const countries = [
        "Hungary",
        "Germany",
        "Switzerland",
        "France",
        "Spain"
    ];

    const dateOfBirthTemp = ["2000.01.20", "1995.01.20", "1979.01.20", "1986.01.20", "1969.01.20"];

    const jobs = ["nodejs", "html", "css", "javascript", "angular"];
    const goodToHave = ["asp .net", "english b2", "react"];
    let minSalary = 100000;
    let maxSalary = 200000; 
    let email = 1;
    let Jobs = [];
    const hashedPW = await bcrypt.hash("123", 10);
    for(let i = 0; i < 5; i++){
        const newUser = new User({
            fullname: "User"+(i+1),
            phoneNumber: "+36201234567",
            email: "test"+email+"@test.com",
            password: hashedPW,
            cvPath: "",
            bookmarks: [],
        });

        const newemployer = new Employer({
            companyName: companyNames[i],
            logoPath: companyLogo[i],
            phoneNumber: "+36301234567",
            email: "comp"+email+"@test.com",
            password: hashedPW,
            website: `www.${companyNames[i]}.com`,
            city: cities[i],
            country: countries[i],
            jobPosts: Jobs, //array of objectIDs of jobposts
            bookmarks: []
        });
        const result = await newemployer.save(); 
        const result2 = await newUser.save(); 
        
        if(!result || !result2){
            return res.status(500).send({ err: "Error in saving employer." });
        }
        email = email + 1;
    }

    let newPost;
    let numero = 1;
    const dummyText = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora, nulla adipisci totam quam mollitia soluta iusto animi praesentium suscipit incidunt eos provident tempore vitae veniam eveniet eligendi qui quibusdam aliquam eius officiis recusandae. Ad dolorem veritatis nam natus iste praesentium reiciendis numquam sed, magnam consequuntur voluptates qui suscipit modi minus. Quas fuga sapiente officia, ipsum obcaecati, soluta ut voluptatum eaque delectus facere amet aliquam sint, est exercitationem debitis excepturi? Quos aspernatur inventore beatae nam illum exercitationem consequuntur consequatur totam voluptate a sapiente et impedit tenetur explicabo quibusdam nihil nobis, neque cum ipsum illo molestias, ea repudiandae repellendus consectetur. Sed soluta perspiciatis facere, modi magnam magni velit animi aperiam labore iste obcaecati error ex facilis a enim, omnis minima rem impedit eius eligendi! Distinctio, assumenda. Saepe voluptates eum inventore repellat temporibus autem laboriosam exercitationem, porro dolorum numquam architecto alias tempora. Alias architecto ut dolor corporis nam laboriosam voluptatem porro provident consequuntur. Suscipit, blanditiis? Earum voluptatibus quas incidunt illo consectetur sint accusantium libero adipisci fugit nemo exercitationem, quae ipsam saepe ad iure eaque accusamus? Cupiditate libero culpa dolor ad adipisci voluptatem illo sunt molestias minus eius eos consequatur, accusamus doloremque autem sit magni atque error consequuntur! Earum aliquam minima dolore officiis, placeat iste officia pariatur, iusto, culpa itaque deleniti magni reprehenderit quisquam labore! Quaerat quas ab autem reprehenderit. Totam fugit ipsum libero nam molestias consequuntur officia expedita sequi ducimus deleniti cumque ut exercitationem corporis qui corrupti ipsam odio, a numquam tempore, voluptas omnis laudantium saepe iste cum. Quam voluptates sunt culpa deleniti porro ipsum quae unde soluta aperiam recusandae voluptatem, quisquam facere veniam magnam laudantium dolore veritatis officiis necessitatibus doloremque libero maxime similique obcaecati non. Doloribus labore inventore libero quasi, molestias aliquam odio, ab velit facilis dolorem ipsum voluptatem neque debitis? Quos magni quisquam, nulla voluptatibus consequatur ut soluta qui facilis aliquid ducimus eius, numquam omnis maxime alias. A nihil, esse cupiditate nobis enim voluptas ullam vero qui ea necessitatibus omnis quaerat tempora totam aliquid laudantium in doloremque odit fuga voluptatibus officiis similique? Deserunt aut, doloribus repellendus amet illo voluptate a eius fugiat architecto est accusantium, vitae explicabo perspiciatis inventore similique assumenda quod laborum. Optio laboriosam voluptatem quos dolore minima officiis perspiciatis nostrum similique soluta delectus ab odio animi harum repellat, unde dicta? Reprehenderit, ipsam eos. Dignissimos sint fuga voluptatem animi blanditiis qui et, suscipit magnam cumque, numquam at quae esse! Commodi distinctio ea laborum itaque! Quas reiciendis soluta quis dolor nobis, corporis accusantium doloremque ipsum repellendus impedit assumenda ut quisquam amet ipsam consequuntur asperiores nisi. Optio dolor deleniti impedit repellendus omnis recusandae quaerat? Sapiente aliquid, nulla qui neque ducimus laboriosam cupiditate harum maiores odio, vero similique, nobis blanditiis hic molestiae delectus optio explicabo excepturi itaque. Saepe, mollitia. Consectetur rem ut explicabo reiciendis, beatae, recusandae voluptatem excepturi quidem minus quasi molestias. Quisquam quia vitae omnis id harum dolore itaque culpa accusantium. Adipisci velit nemo perferendis consequuntur excepturi! Expedita, non voluptas. Debitis, excepturi minima culpa repellat tenetur iure quibusdam omnis eaque beatae delectus temporibus placeat accusantium voluptatibus";
    for (let i = 0; i < 5; i++) {
        const temp = await Employer.find();
        const employer = temp[i];
        for (let j = 0; j < 5; j++) {
            const allJobs = jobs.concat(goodToHave);
            let currentIndex = allJobs.length,  randomIndex;
        
            //While there remain elements to shuffle...
            while (currentIndex != 0) {
                //Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
        
                //And swap it with the current element.
                [allJobs[currentIndex], allJobs[randomIndex]] = [
                    allJobs[randomIndex], allJobs[currentIndex]
                ];
            }
            let paramJobs = [];
            let paramGood = [];
            const totalLength = jobs.length+goodToHave.length;
            for(let i = 0; i < Math.floor(Math.random()* 5); i++){
                paramJobs.push(allJobs[i]);
            }
            for(let i = 0; i < Math.floor(Math.random()* 3); i++){
                paramGood.push(allJobs[i]);
            }

            newPost = new JobPost({
                creator: employer._id,
                companyName: employer.companyName,
                logoPath: employer.logoPath,
                phoneNumber: employer.phoneNumber,
                website: employer.website,
                email: employer.email,
                city: employer.city,
                country: employer.country,
                description: dummyText,
                requiredSkills: paramJobs,
                goodToHaveSkills: paramGood,
                positionName: "Software Developer"+(numero++),
                homeOffice: true,
                salaryMin: minSalary += 50000,
                salaryMax: maxSalary += 50000,
                appliedUser: []
            });
            let num = Math.floor(Math.random()*2);
            if(num) num = true;
            else num = false;
            newPost.homeOffice = num;
            Jobs.push(newPost);
            const result2 = await newPost.save();
            
            if(!result2){
                return res.status(500).send({ err: "Error in saving post." });
            }
        }
        employer.jobPosts = Jobs;
        const test = await employer.save();
        if(!test){
            return res.status(500).send({ err: "Error in saving post222." });
        }
        Jobs = [];
    }
    return res.send("Generated dummy data!");
});


module.exports = router;