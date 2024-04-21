// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('g17DB');

//  6601cc33774536b642ae5198 65d1c32f8eca2316586b2c5b 
// update project id 6601cc33774536b642ae5198 where previous project id is 65d1c32f8eca2316586b2c5b
// db.issues.updateMany({ project_id: ObjectId("65d1c32f8eca2316586b2c5b") }, { $set: { project_id: "6601cc33774536b642ae5198" } });

// find all projectusers where project id is 65d1c32f8eca2316586b2c5b
// db.projectusers.find({ projectId: ObjectId("65d1c32f8eca2316586b2c5b") });

// update projectusers where project id is 65d1c32f8eca2316586b2c5b to 6601cc33774536b642ae5198
// db.projectusers.updateMany({ projectId: ObjectId("65d1c32f8eca2316586b2c5b") }, 
// { $set: { projectId: ObjectId("6601cc33774536b642ae5198") } });

// find all issues where project id is 6601cc33774536b642ae5198 and user id is 660146a56d7797df1a18ba8d
// db.issues.find({ project_id: ObjectId("6601cc33774536b642ae5198")});

// update 6601cc33774536b642ae5198 project id issues with in form of object project id
// db.issues.updateMany({ project_id: "6601cc33774536b642ae5198" },
// { $set: { project_id: ObjectId("6601cc33774536b642ae5198") } });


// update all issues with isDeleted field to false
// db.projectusers.updateMany({}, { $set: { isDeleted: false } });

// get issues where title is Email test 5
// db.issues.find({ title: "Email test 5" });

// update user role where email is manager@gmail.com
// db.projectusers.updateOne({ email: "manager@gmail.com" }, { $set: { role: "manager" } });

// db.users.find({ email: "manager@gmail.com" });

// set createdAt and updatedAt fields to current date in public issues
// db.publicissues.updateMany({}, { $set: { createdAt: new Date(), updatedAt: new Date() } });

// get issues fro id = 6609a3ac5dc31d6b7183288c
// db.issues.find({ _id: ObjectId("6609a3ac5dc31d6b7183288c") });

// add isDeleted field to all comments
db.commentmodels.updateMany({}, { $set: { isDeleted: false } });