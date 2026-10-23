const API_BASE_URL = 'https://gn8bkpd8.ap-southeast.insforge.app';
const API_KEY = process.env.INSFORGE_API_KEY;

if (!API_KEY) {
  throw new Error('Set INSFORGE_API_KEY in the environment before running this script.');
}

async function runSql(query) {
  const res = await fetch(`${API_BASE_URL}/api/database/advance/rawsql`, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, params: [] })
  });
  const data = await res.json();
  return data;
}

async function setupDatabase() {
  console.log('Creating tables...');

  const schema = `
  CREATE TABLE IF NOT EXISTS nuramed_requests (
    id VARCHAR(64) PRIMARY KEY,
    patient_name VARCHAR(128) NOT NULL,
    patient_age INT DEFAULT 50,
    patient_phone VARCHAR(32),
    medicine VARCHAR(128),
    current_dose VARCHAR(128),
    issue TEXT,
    reason VARCHAR(128),
    side_effects TEXT,
    is_urgent BOOLEAN DEFAULT FALSE,
    status VARCHAR(32) DEFAULT 'pending',
    source VARCHAR(32) DEFAULT 'app',
    doctor_notes TEXT DEFAULT '',
    modified_dosage VARCHAR(128) DEFAULT '',
    photo_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS nuramed_doctors (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    specialty VARCHAR(128) NOT NULL,
    languages VARCHAR(128) NOT NULL,
    status VARCHAR(32) DEFAULT 'online',
    next_slot VARCHAR(64),
    experience VARCHAR(64),
    hospital VARCHAR(128),
    avatar VARCHAR(256),
    phone VARCHAR(32)
  );

  CREATE TABLE IF NOT EXISTS nuramed_audit_logs (
    id SERIAL PRIMARY KEY,
    request_id VARCHAR(64),
    user_role VARCHAR(64) NOT NULL,
    user_name VARCHAR(128) NOT NULL,
    action VARCHAR(128) NOT NULL,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS nuramed_prescriptions (
    id VARCHAR(64) PRIMARY KEY,
    request_id VARCHAR(64),
    patient_name VARCHAR(128) NOT NULL,
    doctor_name VARCHAR(128) NOT NULL,
    medicines TEXT NOT NULL,
    instructions TEXT,
    status VARCHAR(32) DEFAULT 'approved',
    fulfilled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS nuramed_call_logs (
    id VARCHAR(64) PRIMARY KEY,
    caller_phone VARCHAR(32) NOT NULL,
    menu_selection VARCHAR(64),
    voice_transcription TEXT,
    status VARCHAR(32) DEFAULT 'completed',
    timestamp TIMESTAMPTZ DEFAULT NOW()
  );

  -- Enable RLS and add public read/write policies for prototype demo
  ALTER TABLE nuramed_requests ENABLE ROW LEVEL SECURITY;
  ALTER TABLE nuramed_doctors ENABLE ROW LEVEL SECURITY;
  ALTER TABLE nuramed_audit_logs ENABLE ROW LEVEL SECURITY;
  ALTER TABLE nuramed_prescriptions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE nuramed_call_logs ENABLE ROW LEVEL SECURITY;

  DO $$
  BEGIN
    DROP POLICY IF EXISTS "Public access nuramed_requests" ON nuramed_requests;
    CREATE POLICY "Public access nuramed_requests" ON nuramed_requests FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access nuramed_doctors" ON nuramed_doctors;
    CREATE POLICY "Public access nuramed_doctors" ON nuramed_doctors FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access nuramed_audit_logs" ON nuramed_audit_logs;
    CREATE POLICY "Public access nuramed_audit_logs" ON nuramed_audit_logs FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access nuramed_prescriptions" ON nuramed_prescriptions;
    CREATE POLICY "Public access nuramed_prescriptions" ON nuramed_prescriptions FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access nuramed_call_logs" ON nuramed_call_logs;
    CREATE POLICY "Public access nuramed_call_logs" ON nuramed_call_logs FOR ALL USING (true) WITH CHECK (true);
  END
  $$;
  `;

  const res = await runSql(schema);
  console.log('Schema result:', res);

  // Seed doctors if empty
  const seedDocs = `
  INSERT INTO nuramed_doctors (id, name, specialty, languages, status, next_slot, experience, hospital, avatar, phone)
  VALUES 
    ('doc-1', 'Dr. Meera Sharma', 'General Medicine', 'Hindi, English', 'online', 'Today 3:30 PM', '14 yrs', 'AIIMS New Delhi Affiliate', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300', '+91 98110 23456'),
    ('doc-2', 'Dr. Rajesh Verma', 'Cardiology & Hypertension', 'Hindi, Rajasthani, English', 'online', 'Today 4:15 PM', '18 yrs', 'Sawai Man Singh Hospital, Jaipur', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300', '+91 98290 11223'),
    ('doc-3', 'Dr. Ananya Sen', 'Pulmonology & Respiratory Care', 'Hindi, English', 'busy', 'Today 5:45 PM', '9 yrs', 'Metro District Hospital', 'https://images.unsplash.com/photo-1594824813583-0570889f812d?auto=format&fit=crop&q=80&w=300', '+91 98310 99887'),
    ('doc-4', 'Dr. Vikram Rathore', 'Emergency & Community Medicine', 'Hindi, Rajasthani', 'offline', 'Tomorrow 10:00 AM', '12 yrs', 'Primary Health Centre (PHC) Phagi', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300', '+91 94140 55443')
  ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;
  `;
  const seedRes = await runSql(seedDocs);
  console.log('Seed doctors result:', seedRes);

  // Check doctors count
  const check = await runSql('SELECT count(*) FROM nuramed_doctors;');
  console.log('Doctors count:', check);
}

setupDatabase();
