// userMiddleware.js

const generateUsername = function(next) {
    console.log("Middleware activated for role:", this.role);
    if (this.role === 'parent' && !this.username) {
        if (!this.firstName || !this.lastName || !this.address || !this.address.zipCode) {
            const err = new Error('Missing fields for generating username');
            console.log("Middleware error: Missing necessary fields");
            return next(err);
        }
        this.username = `${this.firstName.toLowerCase()}${this.lastName.toLowerCase()}${this.address.zipCode}`;
        console.log("Generated username:", this.username);  // Confirm the username output
    } else {
        console.log("Middleware skipped: not a parent or username already set");
    }
    next();
};

module.exports = { generateUsername };
