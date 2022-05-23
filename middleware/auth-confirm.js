require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = function(req, res, next){
    try{
        const reqToken = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(reqToken, process.env.JWT_TOKEN_SECRET);
        req.endUserData = {
            email: decodedToken.email,
            endUserID: decodedToken.endUserID
        }
        next();
    }catch(e){
        return res.status(401).json({
            message: "You are not authenticated!"
        });
    }
}