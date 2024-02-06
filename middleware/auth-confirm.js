require("dotenv").config();
import { verify } from "jsonwebtoken";

export default function(req, res, next){
    try{
        const reqToken = req.headers.authorization.split(" ")[1];
        const decodedToken = verify(reqToken, process.env.JWT_TOKEN_SECRET);
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