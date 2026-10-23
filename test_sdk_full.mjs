import { createClient } from '@insforge/sdk';

const insforge = createClient({
  baseUrl: 'https://gn8bkpd8.ap-southeast.insforge.app',
  anonKey: 'anon_9828e9e32345f506ff14d642ea70f3ef16f765f79a469469534dfe05751e84a2'
});

async function testFull() {
  console.log('Testing select requests...');
  const { data: reqs, error: err1 } = await insforge.database
    .from('nuramed_requests')
    .select();
  console.log('Requests count:', reqs ? reqs.length : 0, 'Error:', err1);

  console.log('Testing select audit logs...');
  const { data: logs, error: err2 } = await insforge.database
    .from('nuramed_audit_logs')
    .select();
  console.log('Logs count:', logs ? logs.length : 0, 'Error:', err2);

  console.log('Testing select prescriptions...');
  const { data: rx, error: err3 } = await insforge.database
    .from('nuramed_prescriptions')
    .select();
  console.log('Prescriptions count:', rx ? rx.length : 0, 'Error:', err3);
}

testFull();
