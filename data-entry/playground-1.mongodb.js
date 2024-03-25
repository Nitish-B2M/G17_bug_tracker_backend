// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('g17DB');

// Create a new document in the collection.
db.getCollection('publicissues').insertMany([{
    title: 'Demo Issue',
    description: 'This is a demo issue',
    feature: 'defect',
    created_by: '65c533464b4e5eed9d8cfa66',
    votes: 0,
    downvotes: 0,
    file_id: '',
    created_at: new Date(),
    updated_at: new Date()
}, {
    title: 'Issue 2',
    description: 'This is issue raised for bug fix',
    feature: 'bug',
    created_by: '65c533464b4e5eed9d8cfa66',
    votes: 0,
    downvotes: 0,
    file_id: '',
    created_at: new Date(),
    updated_at: new Date()
}, {
    title: 'Enhancement Issue',
    description: 'This is an enhancement issue',
    feature: 'enhancement',
    created_by: '65c533464b4e5eed9d8cfa66',
    votes: 0,
    downvotes: 0,
    file_id: '',
    created_at: new Date(),
    updated_at: new Date()
}]);

