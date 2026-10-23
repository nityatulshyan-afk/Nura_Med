/**
 * NuraMed - InsForge Backend Connector
 * Connects directly to InsForge BaaS (PostgreSQL, Audit Logs, Storage)
 */

const INSFORGE_CONFIG = {
  baseUrl: 'https://gn8bkpd8.ap-southeast.insforge.app',
  anonKey: 'anon_9828e9e32345f506ff14d642ea70f3ef16f765f79a469469534dfe05751e84a2'
};

class InsForgeClient {
  constructor() {
    this.baseUrl = INSFORGE_CONFIG.baseUrl;
    this.anonKey = INSFORGE_CONFIG.anonKey;
    this.isOnline = true;
    this.initLocalStore();
  }

  initLocalStore() {
    if (!localStorage.getItem('nuramed_offline_seeded')) {
      const initialRequests = [
        {
          id: 'REQ-101',
          patient_name: 'Ramesh Kumar',
          patient_age: 62,
          patient_phone: '+91 98765 43210',
          medicine: 'Amlodipine 5mg',
          current_dose: '1 tablet daily (morning)',
          issue: 'Feeling occasional morning dizziness and lightheadedness after taking tablet for 3 weeks.',
          reason: 'Dose too high or low',
          side_effects: 'Dizziness, Mild Fatigue',
          is_urgent: false,
          status: 'pending',
          source: 'app',
          created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 'REQ-102',
          patient_name: 'Kamla Devi',
          patient_age: 70,
          patient_phone: '+91 94140 88219',
          medicine: 'Metformin 500mg',
          current_dose: '2 tablets daily with meals',
          issue: 'IVR Voice message: Chhathi mein jalan aur dawai khatam ho rahi hai. Doctor sahib se baat karni hai.',
          reason: 'Dose review & refill',
          side_effects: 'Mild nausea',
          is_urgent: false,
          status: 'pending',
          source: 'ivr',
          created_at: new Date(Date.now() - 2700000).toISOString()
        },
        {
          id: 'REQ-103',
          patient_name: 'Ramu Lal (via ASHA Sunita)',
          patient_age: 68,
          patient_phone: '+91 96023 55412',
          medicine: 'Atenolol 50mg',
          current_dose: '1 tablet daily',
          issue: 'ASHA field visit noted resting pulse 54 bpm. Patient feels breathless walking uphill. Patient consent verified.',
          reason: 'Side effect',
          side_effects: 'Breathlessness, Bradycardia',
          is_urgent: true,
          status: 'pending',
          source: 'health_worker',
          created_at: new Date(Date.now() - 900000).toISOString()
        }
      ];
      localStorage.setItem('nuramed_requests', JSON.stringify(initialRequests));
      localStorage.setItem('nuramed_offline_seeded', 'true');
    }
  }

  async runSql() {
    console.warn('InsForge raw SQL is disabled in the browser; use a server-side endpoint.');
    this.isOnline = false;
    return null;
  }

  async checkHealth() {
    const start = performance.now();
    try {
      const rows = await this.runSql('SELECT 1 as ping;');
      const latency = Math.round(performance.now() - start);
      return { connected: !!rows, latency, backend: 'InsForge PostgreSQL' };
    } catch (e) {
      return { connected: false, latency: 0, backend: 'Offline Local' };
    }
  }

  // --- Requests (Portal 1, IVR, Health Worker) ---
  async getRequests() {
    const rows = await this.runSql('SELECT * FROM nuramed_requests ORDER BY created_at DESC;');
    if (rows && rows.length > 0) {
      localStorage.setItem('nuramed_requests', JSON.stringify(rows));
      return rows;
    }
    const local = localStorage.getItem('nuramed_requests');
    return local ? JSON.parse(local) : [];
  }

  async createRequest(reqData) {
    const id = reqData.id || `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq = {
      id,
      patient_name: reqData.patient_name || 'Patient',
      patient_age: parseInt(reqData.patient_age, 10) || 55,
      patient_phone: reqData.patient_phone || '+91 98000 00000',
      medicine: reqData.medicine || 'General Rx',
      current_dose: reqData.current_dose || '1 OD',
      issue: reqData.issue || '',
      reason: reqData.reason || 'Dose Review',
      side_effects: reqData.side_effects || 'None',
      is_urgent: !!reqData.is_urgent,
      status: 'pending',
      source: reqData.source || 'app',
      doctor_notes: '',
      modified_dosage: '',
      photo_url: reqData.photo_url || '',
      created_at: new Date().toISOString()
    };

    const sql = `
      INSERT INTO nuramed_requests 
      (id, patient_name, patient_age, patient_phone, medicine, current_dose, issue, reason, side_effects, is_urgent, status, source, photo_url, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING *;
    `;
    const params = [
      newReq.id, newReq.patient_name, newReq.patient_age, newReq.patient_phone,
      newReq.medicine, newReq.current_dose, newReq.issue, newReq.reason,
      newReq.side_effects, newReq.is_urgent, newReq.status, newReq.source, newReq.photo_url
    ];

    await this.runSql(sql, params);

    // Immutable audit log
    await this.addAuditLog({
      request_id: id,
      user_role: reqData.source === 'health_worker' ? 'health_worker' : reqData.source === 'ivr' ? 'ivr_system' : 'patient',
      user_name: reqData.patient_name,
      action: 'SUBMIT_REQUEST',
      details: `Prescription review request created for ${newReq.medicine} (${newReq.reason}) via ${newReq.source}`
    });

    // Update local cache
    const current = await this.getRequests();
    const updated = [newReq, ...current.filter(r => r.id !== id)];
    localStorage.setItem('nuramed_requests', JSON.stringify(updated));

    return newReq;
  }

  async updateRequestStatus(id, status, notes = '', modifiedDosage = '', doctorName = 'Dr. Meera Sharma') {
    const sql = `
      UPDATE nuramed_requests 
      SET status = $1, doctor_notes = $2, modified_dosage = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *;
    `;
    await this.runSql(sql, [status, notes, modifiedDosage, id]);

    // Update local cache
    const current = await this.getRequests();
    const found = current.find(r => r.id === id);
    if (found) {
      found.status = status;
      found.doctor_notes = notes;
      found.modified_dosage = modifiedDosage;
      found.updated_at = new Date().toISOString();
      localStorage.setItem('nuramed_requests', JSON.stringify(current));
    }

    // Add audit log
    await this.addAuditLog({
      request_id: id,
      user_role: 'doctor',
      user_name: doctorName,
      action: status.toUpperCase(),
      details: `Doctor marked request ${status.toUpperCase()}. Notes: ${notes || 'None'}. Modified Dosage: ${modifiedDosage || 'Unchanged'}`
    });

    // If approved or modified, create approved prescription record
    if ((status === 'approved' || status === 'modified') && found) {
      const rxId = `RX-${Math.floor(1000 + Math.random() * 9000)}`;
      const medicines = status === 'modified' && modifiedDosage 
        ? `${found.medicine} -> ${modifiedDosage}`
        : `${found.medicine} (${found.current_dose})`;
      
      const rxSql = `
        INSERT INTO nuramed_prescriptions (id, request_id, patient_name, doctor_name, medicines, instructions, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, 'approved', NOW());
      `;
      await this.runSql(rxSql, [rxId, id, found.patient_name, doctorName, medicines, notes || 'Continue as prescribed']);

      // Local prescription cache
      const prescriptions = await this.getPrescriptions();
      prescriptions.unshift({
        id: rxId,
        request_id: id,
        patient_name: found.patient_name,
        doctor_name: doctorName,
        medicines,
        instructions: notes || 'Continue as prescribed',
        status: 'approved',
        created_at: new Date().toISOString()
      });
      localStorage.setItem('nuramed_prescriptions', JSON.stringify(prescriptions));
    }

    return found;
  }

  // --- Doctors (Portal 2 Roster) ---
  async getDoctors() {
    const rows = await this.runSql('SELECT * FROM nuramed_doctors ORDER BY id ASC;');
    if (rows && rows.length > 0) {
      localStorage.setItem('nuramed_doctors', JSON.stringify(rows));
      return rows;
    }
    const local = localStorage.getItem('nuramed_doctors');
    if (local) return JSON.parse(local);

    const fallbackDoctors = [
      {
        id: 'doc-1',
        name: 'Dr. Meera Sharma',
        specialty: 'General Medicine',
        languages: 'Hindi, English',
        status: 'online',
        next_slot: 'Today 3:30 PM',
        experience: '14 yrs',
        hospital: 'AIIMS New Delhi Affiliate',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
        phone: '+91 98110 23456'
      },
      {
        id: 'doc-2',
        name: 'Dr. Rajesh Verma',
        specialty: 'Cardiology & Hypertension',
        languages: 'Hindi, Rajasthani, English',
        status: 'online',
        next_slot: 'Today 4:15 PM',
        experience: '18 yrs',
        hospital: 'Sawai Man Singh Hospital, Jaipur',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
        phone: '+91 98290 11223'
      },
      {
        id: 'doc-3',
        name: 'Dr. Ananya Sen',
        specialty: 'Pulmonology & Respiratory Care',
        languages: 'Hindi, English',
        status: 'busy',
        next_slot: 'Today 5:45 PM',
        experience: '9 yrs',
        hospital: 'Metro District Hospital',
        avatar: 'https://images.unsplash.com/photo-1594824813583-0570889f812d?auto=format&fit=crop&q=80&w=300',
        phone: '+91 98310 99887'
      },
      {
        id: 'doc-4',
        name: 'Dr. Vikram Rathore',
        specialty: 'Emergency & Community Medicine',
        languages: 'Hindi, Rajasthani',
        status: 'offline',
        next_slot: 'Tomorrow 10:00 AM',
        experience: '12 yrs',
        hospital: 'Primary Health Centre (PHC) Phagi',
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
        phone: '+91 94140 55443'
      }
    ];
    localStorage.setItem('nuramed_doctors', JSON.stringify(fallbackDoctors));
    return fallbackDoctors;
  }

  async updateDoctorStatus(id, newStatus) {
    await this.runSql('UPDATE nuramed_doctors SET status = $1 WHERE id = $2;', [newStatus, id]);
    const docs = await this.getDoctors();
    const doc = docs.find(d => d.id === id);
    if (doc) {
      doc.status = newStatus;
      localStorage.setItem('nuramed_doctors', JSON.stringify(docs));
    }
    return doc;
  }

  // --- Audit Logs (G-3, AD-5) ---
  async getAuditLogs() {
    const rows = await this.runSql('SELECT * FROM nuramed_audit_logs ORDER BY timestamp DESC LIMIT 100;');
    if (rows && rows.length > 0) {
      localStorage.setItem('nuramed_audit_logs', JSON.stringify(rows));
      return rows;
    }
    const local = localStorage.getItem('nuramed_audit_logs');
    return local ? JSON.parse(local) : [];
  }

  async addAuditLog({ request_id, user_role, user_name, action, details }) {
    const entry = {
      request_id: request_id || 'SYSTEM',
      user_role: user_role || 'system',
      user_name: user_name || 'System Operator',
      action: action || 'EVENT',
      details: details || '',
      timestamp: new Date().toISOString()
    };
    await this.runSql(
      'INSERT INTO nuramed_audit_logs (request_id, user_role, user_name, action, details, timestamp) VALUES ($1, $2, $3, $4, $5, NOW());',
      [entry.request_id, entry.user_role, entry.user_name, entry.action, entry.details]
    );
    const logs = await this.getAuditLogs();
    logs.unshift(entry);
    localStorage.setItem('nuramed_audit_logs', JSON.stringify(logs.slice(0, 100)));
    return entry;
  }

  // --- Prescriptions (PH-1, PH-2) ---
  async getPrescriptions() {
    const rows = await this.runSql('SELECT * FROM nuramed_prescriptions ORDER BY created_at DESC;');
    if (rows && rows.length > 0) {
      localStorage.setItem('nuramed_prescriptions', JSON.stringify(rows));
      return rows;
    }
    const local = localStorage.getItem('nuramed_prescriptions');
    return local ? JSON.parse(local) : [];
  }

  async fulfillPrescription(id, pharmacistName = 'Pharmacist (Jan Aushadhi)') {
    await this.runSql('UPDATE nuramed_prescriptions SET status = $1, fulfilled_at = NOW() WHERE id = $2;', ['fulfilled', id]);
    const list = await this.getPrescriptions();
    const item = list.find(p => p.id === id);
    if (item) {
      item.status = 'fulfilled';
      item.fulfilled_at = new Date().toISOString();
      localStorage.setItem('nuramed_prescriptions', JSON.stringify(list));
    }
    await this.addAuditLog({
      request_id: item ? item.request_id : id,
      user_role: 'pharmacy',
      user_name: pharmacistName,
      action: 'PRESCRIPTION_FULFILLED',
      details: `Prescription ${id} marked fulfilled by ${pharmacistName}`
    });
    return item;
  }

  // --- IVR Call Logs (AD-3, Portal 4) ---
  async getCallLogs() {
    const rows = await this.runSql('SELECT * FROM nuramed_call_logs ORDER BY timestamp DESC LIMIT 50;');
    if (rows && rows.length > 0) {
      localStorage.setItem('nuramed_call_logs', JSON.stringify(rows));
      return rows;
    }
    const local = localStorage.getItem('nuramed_call_logs');
    return local ? JSON.parse(local) : [];
  }

  async createCallLog({ caller_phone, menu_selection, voice_transcription, status = 'completed' }) {
    const id = `CALL-${Math.floor(100 + Math.random() * 900)}`;
    const log = {
      id,
      caller_phone,
      menu_selection,
      voice_transcription,
      status,
      timestamp: new Date().toISOString()
    };
    await this.runSql(
      'INSERT INTO nuramed_call_logs (id, caller_phone, menu_selection, voice_transcription, status, timestamp) VALUES ($1, $2, $3, $4, $5, NOW());',
      [id, caller_phone, menu_selection, voice_transcription, status]
    );
    const logs = await this.getCallLogs();
    logs.unshift(log);
    localStorage.setItem('nuramed_call_logs', JSON.stringify(logs));
    return log;
  }
}

// Global instance
window.insforgeClient = new InsForgeClient();
