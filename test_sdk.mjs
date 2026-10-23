import { createClient } from '@insforge/sdk';

const insforge = createClient({
  baseUrl: 'https://gn8bkpd8.ap-southeast.insforge.app',
  anonKey: 'anon_9828e9e32345f506ff14d642ea70f3ef16f765f79a469469534dfe05751e84a2'
});

async function main() {
  const { data, error } = await insforge.database
    .from('nuramed_doctors')
    .select();
  console.log('Error:', error);
  console.log('Doctors data:', data);
}

main();
