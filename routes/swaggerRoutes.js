import { serve, setup } from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "PostLink API",
            version: "1.0.0"
        }
    },
    apis: ["index.js"]
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);

export default function(app){
    app.use("/api-docs", serve, setup(swaggerDocs));
}