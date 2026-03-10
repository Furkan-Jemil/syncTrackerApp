const axios = require('axios');

async function checkSchema() {
  try {
    const res = await axios.options('https://vbhaquqighlordyyrwhs.supabase.co/rest/v1/tasks', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaGFxdXFpZ2hsb3JkeXlyd2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTE4NjMsImV4cCI6MjA4ODYyNzg2M30.GPXgppLNwd9_RxGBGXbM5HMIl7Ef5qq4XwPZjyBIsFg',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaGFxdXFpZ2hsb3JkeXlyd2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTE4NjMsImV4cCI6MjA4ODYyNzg2M30.GPXgppLNwd9_RxGBGXbM5HMIl7Ef5qq4XwPZjyBIsFg'
      }
    });
    console.log(JSON.stringify(res.headers, null, 2));
    
    // Also try doing a GET to see the data shape
    const getRes = await axios.get('https://vbhaquqighlordyyrwhs.supabase.co/rest/v1/tasks?limit=1', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaGFxdXFpZ2hsb3JkeXlyd2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTE4NjMsImV4cCI6MjA4ODYyNzg2M30.GPXgppLNwd9_RxGBGXbM5HMIl7Ef5qq4XwPZjyBIsFg',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaGFxdXFpZ2hsb3JkeXlyd2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTE4NjMsImV4cCI6MjA4ODYyNzg2M30.GPXgppLNwd9_RxGBGXbM5HMIl7Ef5qq4XwPZjyBIsFg'
      }
    });
    console.log(JSON.stringify(getRes.data, null, 2));
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}

checkSchema();
