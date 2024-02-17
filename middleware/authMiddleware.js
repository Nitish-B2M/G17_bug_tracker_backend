const session = require('express-session');

const authMiddleware = async(req, res, next) => {
    const isLoggedIn = req.session.isLoggedIn;
    const userId = req.session.userId;
    console.log(req.session.isLoggedIn, "session.isLoggedIn in authMiddleware");

    console.log(isLoggedIn);
    if (!isLoggedIn) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    next();
}; 
module.exports = authMiddleware;
