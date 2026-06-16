# Firestore Security Specification

This document details the Zero-Trust attribute-based access control (ABAC) plan and verification payloads for HealthPredict.

## 1. Data Invariants

*   **User Document Absolute Ownership**: A user document at `/users/{uid}` can only be created and written to by the authenticated user with that exact `uid`.
*   **Profile Identity Match**: A profile document at `/profiles/{uid}` must match the user's logged-in identity. No user can write a profile for another `uid`.
*   **Assessment User Association**: Assessment documents must contain a `uid` equal to the logged-in user's `uid`. Users can only query (`list` / `get`) assessments matching their `uid`.
*   **Field Immutability**: Values like user `email`, registration `createdAt`, and original assessment `createdAt` cannot be altered once created.
*   **Type and Size Bound Safety**: All string fields are strictly verified for maximum length to prevent exhaustion attacks. All boolean inputs must be strictly validated.

---

## 2. The "Dirty Dozen" Payloads (Exploit Vector Payloads)

These payloads are designed to challenge our rule security gates. Our Firestore rules are engineered to return `PERMISSION_DENIED` for all twelve vectors.

### Vector 1: Shadow Profile Hijack
*Goal:* Attempt to create a profile Document with another user's UID to read or override their medical details.
*Payload (Target: `/profiles/attacker_uid_holding_victim_id`):*
```json
{
  "uid": "victim_user_123",
  "bloodType": "A+",
  "location": "North America",
  "ethnicity": "White",
  "allergies": "None",
  "chronicConditions": "None",
  "medications": "None",
  "updatedAt": "request.time"
}
```

### Vector 2: Privilege Escalation (Shadow Admin Claims)
*Goal:* Adding a system-generated or non-existent administrative property to gain unauthorized database credentials.
*Payload:*
```json
{
  "uid": "my_uid",
  "fullName": "Jane Hacker",
  "email": "jane@example.com",
  "createdAt": "request.time",
  "lastLogin": "request.time",
  "isAdmin": true,
  "role": "SuperAdmin"
}
```

### Vector 3: Data Spoofing (Attempt to fake prediction score)
*Goal:* Attempt to write another user's assessment result with a faked risk percentage.
*Payload:*
```json
{
  "uid": "victim_uid_999",
  "age": 25,
  "weight": 55,
  "height": 160,
  "cycleRegularity": "regular",
  "cycleLength": 5,
  "weightGain": false,
  "hairGrowth": false,
  "hairLoss": false,
  "acne": false,
  "skinDarkening": false,
  "fastFood": false,
  "exercise": true,
  "pelvicPain": false,
  "fatigue": false,
  "predictionPercentage": 98,
  "riskCategory": "HIGH",
  "recommendations": ["Do X", "Do Y"],
  "createdAt": "request.time"
}
```

### Vector 4: Denial of Wallet (Assessment Size Poisoning)
*Goal:* Attempt to save a massive, garbage recommendation array to balloon billing costs.
*Payload:*
```json
{
  "uid": "attacker_uid",
  "age": 25,
  "$garbage": "10MB of junk characters...",
  "predictionPercentage": 10
}
```

### Vector 5: Temporal Fraud (Pre-dating accounts)
*Goal:* Forcing a customized `createdAt` timestamp to make an assessment or profile look highly historical.
*Payload:*
```json
{
  "uid": "attacker_uid",
  "createdAt": "timestamp(2020-01-01T00:00:00Z)"
}
```

### Vector 6: Query Siphoning (Blanket assessment scrapers)
*Goal:* Quizzing/Querying the assessments collection without specifying the logged-in owner's `uid` to inspect random public uploads.
*Read operation check:* Rules must reject any select queries without a strict `.where("uid", "==", current_uid)` filter.

### Vector 7: Immutable Override (Alter registration date)
*Goal:* User tries to modify the immutable `createdAt` field on `/users/{uid}` after initial establishment.
*Payload (Update on `/users/attacker_uid`):*
```json
{
  "createdAt": "timestamp(2026-01-01)"
}
```

### Vector 8: Cross-Tenant Reading (Profile Peeping)
*Goal:* Trying to issue a `get` query for another patient's medical clinical history document.
*Read operation check:* Verified via owner rule: `resource.data.uid == request.auth.uid`.

### Vector 9: Shadow Field Injection
*Goal:* Adding unregistered, malicious properties such as `isVerified: true` directly to the `users` collection.
*Payload:*
```json
{
  "uid": "attacker_uid",
  "fullName": "Imposter",
  "email": "hacker@example.com",
  "isVerified": true
}
```

### Vector 10: Value Type Poisoning
*Goal:* Sending array elements where strings are expected (e.g. `fullName: ["Not", "A", "String"]`).
*Payload:*
```json
{
  "fullName": ["Not", "A", "String"]
}
```

### Vector 11: Id Poisoning (XSS / SQLi strings in docId)
*Goal:* Creating directories/keys with SQL injection or directory-traversal docIds like `../../hack_db`.
*Operation check:* Document IDs must match the `isValidId()` regex gate before writes are evaluated.

### Vector 12: Unverified Imposter Session
*Goal:* Attempting to make writes with a Firebase session where `email_verified` is false (spoofing session identifiers).
*Operation check:* Reject writes if `request.auth.token.email_verified != true`.

---

## 3. Test Cases (Security Rules Validator)

This defines our code invariants and verification rules.

```typescript
// firestore.rules.test.ts
import { assertFails, assertSucceeds } from "@firebase/rules-unit-testing";

// All test vectors in high-coverage mock test suites will return:
// assertFails(vectorPayloadOperation) -> PERMISSION_DENIED
```
