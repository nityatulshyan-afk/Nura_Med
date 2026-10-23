const API_BASE_URL = 'https://gn8bkpd8.ap-southeast.insforge.app';
const API_KEY = process.env.INSFORGE_API_KEY;

if (!API_KEY) {
  throw new Error('Set INSFORGE_API_KEY in the environment before running this script.');
}

async function main() {
  console.log('--- 1. Getting Anon Key ---');
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/tokens/anon`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    console.log('Anon key response:', data);
  } catch(e) {
    console.error('Anon key error:', e);
  }

  console.log('\n--- 2. Getting Backend Metadata ---');
  try {
    const res = await fetch(`${API_BASE_URL}/api/metadata?mcp=true`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY
      }
    });
    const data = await res.json();
    console.log('Backend metadata:', JSON.stringify(data, null, 2));
  } catch(e) {
    console.error('Metadata error:', e);
  }

  console.log('\n--- 3. Fetching DB SDK Docs ---');
  try {
    const res = await fetch(`${API_BASE_URL}/api/docs/db-sdk-typescript`, {
      headers: { 'x-api-key': API_KEY }
    });
    const data = await res.json();
    console.log('DB SDK Docs:', (data.content || JSON.stringify(data)).slice(0, 1500));
  } catch(e) {
    console.error('Doc error:', e);
  }
}

main();
