const axios = require('axios');
const fs = require('fs');

async function checkSchema() {
  try {
    const res = await axios.get('https://vbhaquqighlordyyrwhs.supabase.co/rest/v1/', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaGFxdXFpZ2hsb3JkeXlyd2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTE4NjMsImV4cCI6MjA4ODYyNzg2M30.GPXgppLNwd9_RxGBGXbM5HMIl7Ef5qq4XwPZjyBIsFg',
      }
    });
    fs.writeFileSync('openapi.json', JSON.stringify(res.data, null, 2));
    console.log('Saved to openapi.json');
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}

checkSchema();
