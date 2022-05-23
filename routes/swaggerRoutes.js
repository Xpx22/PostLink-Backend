const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
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

module.exports = function(app){
    app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));
}