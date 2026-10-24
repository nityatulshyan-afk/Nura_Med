# NuraMed

NuraMed is a healthcare access platform designed to connect patients with doctors remotely, reducing unnecessary travel for routine follow-ups and prescription reviews. It supports smartphone users as well as people who rely on basic phones.

## Key Features

- Prescription Review: Patients can request prescription or dosage reviews, with all clinical decisions made by doctors.
- Doctor Availability: View doctor availability and filter by specialty.
- Doctor-Patient Connect: Supports text chat, audio consultations, and low-bandwidth communication options.
- AI Health Assistant: Provides general first-aid and self-care guidance with emergency escalation and doctor handoff.
- Toll-Free IVR: Enables feature-phone users to request consultations, submit prescription review requests, and request callbacks.
- Doctor Dashboard: Manage requests, review patient information, record decisions, and maintain audit logs.
- Admin and Health Worker Portals: Manage doctors and submit requests on behalf of patients.
- Pharmacy Portal: Provides read-only access to approved prescriptions.

## Tech Stack

- Frontend: React / Next.js
- Backend: Node.js or FastAPI
- Database: Shared database for requests, users, and audit logs
- Communication: Twilio Voice, WebRTC / Jitsi
- AI Assistant: Claude API with retrieval-augmented generation (RAG)

## Accessibility and Safety

- Hindi and English language support
- Large-font and high-contrast modes
- Persistent emergency guidance for 108 / 112
- Consent before data or photo submission
- Role-based access control and audit logging
- No AI diagnosis or automatic prescription changes

## System Architecture

NuraMed uses a shared backend to connect the patient web app, doctor dashboard, IVR system, and supporting portals. Requests from different channels enter a common doctor queue, ensuring consistent request tracking and decision management.

## MVP Scope

The initial prototype prioritizes prescription review, doctor availability, the doctor dashboard, an IVR simulator, and the AI assistant with emergency escalation. Advanced features such as video consultations, maps, and WhatsApp reminders may be simulated or deferred.

## Expected Impact

NuraMed aims to improve access to routine healthcare follow-ups, simplify communication between patients and doctors, and make healthcare services more accessible to elderly users and people without smartphones.
