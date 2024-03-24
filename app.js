require("dotenv").config();
const express = require('express');
const app = express();
const connectDB = require("./db/connect");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authMiddleware = require("./middleware/authMiddleware");
const MessageMiddleware = require("./middleware/messageMiddleware");
const session = require('express-session');

const port = process.env.PORT || 3300;

app.get("/", (req, res) => {
    res.send(`Welcome to the Bug Tracking API<br>Use <br>
    <a href="/api/users">/api/users</a>,<br> 
    <a href="/api/projects">/api/projects</a>,<br>
    <a href="/api/issues">/api/issues</a><br>
    to access the data`);
});

// middleware
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 30, // 30 minutes
    }
}));

// routes
const userRouter = require("./routes/users-routes");
const projectRouter = require("./routes/projects-routes");
const issueRouter = require("./routes/issues-routes");
const issueTrackerRouter = require("./routes/issues-tracker-routes");
const publicIssueRouter = require("./routes/public-issue-routes");
const authRouter = require("./routes/auth-routes");
const commonConsole = require("./common/commonConsole");


// use the middleware for all the routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/projects", projectRouter);
app.use("/api/issues", issueRouter);
app.use("/api/issue-tracker", issueTrackerRouter);
app.use("/api/public-issues", publicIssueRouter);

// error handling middleware
app.use(MessageMiddleware);

const start = async () => {
    try {
        await connectDB();
        app.listen(port, () => {
            console.log(`\n*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*`);
            console.log(`Server is listening on port ${port}`);
            console.log(`*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*\n`);
        });
    } catch (error) {
        console.log(`\n*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*`);
        console.log(error, "Error connecting to the database");
        console.log(`*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*\n`);
    }
};

start();