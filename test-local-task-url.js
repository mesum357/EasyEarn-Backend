const mongoose = require('mongoose');

// Task Schema (same as in app.js)
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  reward: { type: Number, required: true },
  category: { type: String, required: true, enum: ['Social Media', 'App Store', 'Survey', 'Other'] },
  timeEstimate: { type: String, required: true },
  requirements: [{ type: String }],
  url: { type: String, default: "" },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);

async function testLocalTaskUrl() {
  try {
    // Connect to MongoDB (you'll need to update this with your local MongoDB URL)
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/easyearn');
    console.log('Connected to MongoDB');
    
    // Create a test task with URL
    const testTask = new Task({
      title: 'Local Test Task with URL',
      description: 'This is a local test task to verify URL field is working',
      reward: 5.00,
      category: 'Social Media',
      timeEstimate: '10 min',
      requirements: ['Complete the task', 'Take a screenshot'],
      url: 'https://example.com/local-test-task'
    });
    
    await testTask.save();
    console.log('✅ Task saved with URL:', testTask.url);
    
    // Retrieve the task
    const retrievedTask = await Task.findById(testTask._id);
    console.log('✅ Task retrieved with URL:', retrievedTask.url);
    
    // Clean up
    await Task.findByIdAndDelete(testTask._id);
    console.log('✅ Test task cleaned up');
    
  } catch (error) {
    console.error('Error testing local task URL:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testLocalTaskUrl(); 