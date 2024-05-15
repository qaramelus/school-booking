// userMiddleware.js

const generateUsername = function(req, res, next) {
    if (!req.body.username && req.body.firstName && req.body.lastName) {
        req.body.username = `${req.body.firstName.toLowerCase()}${req.body.lastName.toLowerCase()}`;
        console.log("Generated username:", req.body.username);
    } else if (!req.body.username) {
        console.log("Middleware error: Missing firstName or lastName for generating username");
        return next(new Error('Missing firstName or lastName for generating username'));
    }
    next();
};


const generateUsernameFromEmail = (email) => {
    return email.split('@')[0]; // Simply extracts the part before the '@' symbol as username
};

module.exports = { generateUsername, generateUsernameFromEmail };
