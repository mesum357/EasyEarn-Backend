const axios = require('axios');

async function testTaskUrl() {
  try {
    console.log('Testing task creation with URL...');
    
    // Test creating a task with URL
    const createResponse = await axios.post('https://easyearn-backend-production-01ac.up.railway.app/api/admin/tasks', {
      title: 'Test Task with URL',
      description: 'This is a test task to verify URL field is working',
      reward: 5.00,
      category: 'Social Media',
      timeEstimate: '10 min',
      requirements: ['Complete the task', 'Take a screenshot'],
      url: 'https://example.com/test-task'
    });
    
    console.log('Task creation response:', createResponse.data);
    
    if (createResponse.data.success && createResponse.data.task.url) {
      console.log('✅ SUCCESS: Task created with URL:', createResponse.data.task.url);
    } else {
      console.log('❌ FAILED: Task created but URL is missing or empty');
    }
    
    // Test fetching tasks to see if URL is included
    const fetchResponse = await axios.get('https://easyearn-backend-production-01ac.up.railway.app/api/admin/tasks');
    
    console.log('Fetch tasks response:', fetchResponse.data);
    
    if (fetchResponse.data.success) {
      const testTask = fetchResponse.data.tasks.find(t => t.title === 'Test Task with URL');
      if (testTask && testTask.url) {
        console.log('✅ SUCCESS: Task retrieved with URL:', testTask.url);
      } else {
        console.log('❌ FAILED: Task retrieved but URL is missing');
      }
    }
    
  } catch (error) {
    console.error('Error testing task URL:', error.response?.data || error.message);
  }
}

testTaskUrl(); 