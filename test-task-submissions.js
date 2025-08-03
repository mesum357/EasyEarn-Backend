const axios = require('axios');

const BACKEND_URL = 'https://easyearn-backend-production-01ac.up.railway.app';

async function testTaskSubmissions() {
  console.log('Testing task submissions endpoints...\n');

  try {
    // Test 1: Get all task submissions
    console.log('1. Testing GET /api/admin/task-submissions...');
    const submissionsResponse = await axios.get(`${BACKEND_URL}/api/admin/task-submissions`, { timeout: 10000 });
    console.log('✅ Task submissions endpoint response:', submissionsResponse.status);
    console.log('Submissions count:', submissionsResponse.data.submissions?.length || 0);
    console.log('Sample submission:', submissionsResponse.data.submissions?.[0] || 'No submissions found');
    console.log('');

    // Test 2: Get all tasks
    console.log('2. Testing GET /api/admin/tasks...');
    const tasksResponse = await axios.get(`${BACKEND_URL}/api/admin/tasks`, { timeout: 10000 });
    console.log('✅ Tasks endpoint response:', tasksResponse.status);
    console.log('Tasks count:', tasksResponse.data.tasks?.length || 0);
    console.log('Sample task:', tasksResponse.data.tasks?.[0] || 'No tasks found');
    console.log('');

    // Test 3: Get public tasks
    console.log('3. Testing GET /api/tasks...');
    const publicTasksResponse = await axios.get(`${BACKEND_URL}/api/tasks`, { timeout: 10000 });
    console.log('✅ Public tasks endpoint response:', publicTasksResponse.status);
    console.log('Public tasks count:', publicTasksResponse.data.tasks?.length || 0);
    console.log('Sample public task:', publicTasksResponse.data.tasks?.[0] || 'No public tasks found');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testTaskSubmissions().catch(console.error); 