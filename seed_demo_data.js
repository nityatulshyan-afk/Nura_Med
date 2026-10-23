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
  return await res.json();
}

async function seedData() {
  const query = `
  -- Clear existing demo data to keep fresh
  DELETE FROM nuramed_requests;
  DELETE FROM nuramed_audit_logs;
  DELETE FROM nuramed_prescriptions;
  DELETE FROM nuramed_call_logs;

  -- 1. Initial request from Ramesh (App)
  INSERT INTO nuramed_requests (id, patient_name, patient_age, patient_phone, medicine, current_dose, issue, reason, side_effects, is_urgent, status, source, created_at)
  VALUES 
    ('REQ-101', 'Ramesh Kumar', 62, '+91 98765 43210', 'Amlodipine 5mg', '1 tablet daily (morning)', 'Feeling occasional morning dizziness and lightheadedness after taking tablet for 3 weeks.', 'Dose too high or low', 'Dizziness, Mild Fatigue', FALSE, 'pending', 'app', NOW() - INTERVAL '2 hours'),
    ('REQ-102', 'Kamla Devi', 70, '+91 94140 88219', 'Metformin 500mg', '2 tablets daily with meals', 'IVR Voice message: Chhathi mein jalan aur dawai khatam ho rahi hai. Doctor sahib se baat karni hai.', 'Dose review & refill', 'Mild nausea', FALSE, 'pending', 'ivr', NOW() - INTERVAL '45 minutes'),
    ('REQ-103', 'Ramu Lal (via ASHA Sunita)', 68, '+91 96023 55412', 'Atenolol 50mg', '1 tablet daily', 'ASHA field visit noted resting pulse 54 bpm. Patient feels breathless walking uphill. Patient consent verified.', 'Side effect', 'Breathlessness, Bradycardia', TRUE, 'pending', 'health_worker', NOW() - INTERVAL '15 minutes');

  -- 2. Audit logs
  INSERT INTO nuramed_audit_logs (request_id, user_role, user_name, action, details, timestamp)
  VALUES 
    ('REQ-101', 'patient', 'Ramesh Kumar', 'SUBMIT_REQUEST', 'Prescription review requested for Amlodipine 5mg with symptoms: Dizziness', NOW() - INTERVAL '2 hours'),
    ('REQ-102', 'patient (IVR)', 'Kamla Devi', 'IVR_VOICE_RECORD', 'Toll-free IVR menu option 2 chosen. Audio recorded and routed to doctor queue.', NOW() - INTERVAL '45 minutes'),
    ('REQ-103', 'health_worker', 'Sunita (ASHA)', 'PROXY_SUBMIT', 'Submitted request for Ramu Lal with informed physical consent on form.', NOW() - INTERVAL '15 minutes');

  -- 3. Previous approved prescription for Ramesh (history)
  INSERT INTO nuramed_prescriptions (id, request_id, patient_name, doctor_name, medicines, instructions, status, created_at)
  VALUES 
    ('RX-8091', 'REQ-090', 'Ramesh Kumar', 'Dr. Meera Sharma', 'Amlodipine 5mg (1 tab OD morning), Telmisartan 40mg (1 tab OD)', 'Take after breakfast. Monitor BP weekly. Avoid sudden standing up.', 'approved', NOW() - INTERVAL '30 days');

  -- 4. Call logs for IVR
  INSERT INTO nuramed_call_logs (id, caller_phone, menu_selection, voice_transcription, status, timestamp)
  VALUES 
    ('CALL-01', '+91 94140 88219', '2 - Prescription Review', 'Doctor sahib, sugar ki goli se chakkar aa rahe hain, krupiya dosage review karein.', 'completed', NOW() - INTERVAL '45 minutes'),
    ('CALL-02', '+91 98291 33445', '1 - Talk to Doctor', 'Dialed 1, routed to online roster.', 'completed', NOW() - INTERVAL '3 hours'),
    ('CALL-03', '+91 99887 11223', '0 - Callback Request', 'Human callback requested from remote village.', 'callback_pending', NOW() - INTERVAL '1 hour');
  `;

  const res = await runSql(query);
  console.log('Seed result:', res);
}

seedData();
