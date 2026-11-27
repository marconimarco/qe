# Security Specification & Threat Model (`security_spec.md`)

## 1. Data Invariants & Master Source of Truth
1. **Verified Identity Gate**: Every authenticated operation requires `request.auth != null && request.auth.token.email_verified == true`.
2. **RBAC Authority**: Privileged mutations on `/app_users/{userId}` and `/access_logs/{logId}` are gated by `isAdmin()`, backed by `/admins/{uid}` and the bootstrapped admin email `mrcmrcn@gmail.com` (never client claims).
3. **Zero Plaintext Credentials in Firestore**: `/app_users/{userId}` stores only salted SHA-256 `passwordHash` and `passwordSalt`; plaintext passwords are never persisted in Firestore.
4. **PII Isolation**: `/app_users/{userId}` documents contain user email addresses and therefore strictly forbid unauthenticated or cross-user reads (`resource.data.email == request.auth.token.email`, `resource.data.uid == request.auth.uid`, or admin access).
5. **Append-Only Audit Logs**: `/access_logs/{logId}` entries require `uid == request.auth.uid` and `createdAt == request.time` on creation, and forbid updates.
6. **Post-Quantum E2EE Relay Integrity**:
   - `/pqc_invites/{inviteCode}` forbids `list` queries so invite codes cannot be scraped.
   - `/pqc_rooms/{roomId}` and `/pqc_invites/{inviteCode}` enforce atomic co-creation via `existsAfter()`.
   - `/pqc_rooms/{roomId}/peers/{peerId}` requires a parent active room via `get()` and enforces valid 1184-byte ML-KEM-768 hex public keys (`size() == 2368`).
   - `/pqc_rooms/{roomId}/messages/{messageId}` requires the sender's peer document to exist in the room with matching `uid == request.auth.uid` and strictly rejects plaintext fields.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unverified Email Spoofing**: Request claiming `email: 'mrcmrcn@gmail.com'` with `email_verified: false`. -> **DENY**
2. **Shadow Field Injection on `app_users`**: Valid admin create payload with extra ghost field `isSuperAdmin: true`. -> **DENY** (`hasOnly` rejects).
3. **Self-Role Escalation**: Non-admin user updating own `/app_users/{userId}` to change `role: 'admin'` or `allowedIcons`. -> **DENY** (`affectedKeys().hasOnly(...)` restricts non-admin updates).
4. **Cross-User PII Read / Scrape**: Standard user listing `/app_users` without matching `email` or `uid`. -> **DENY** (`allow list` evaluates `resource.data`).
5. **1MB Poisoned Document ID**: Creating `/app_users/<2000-char-id>` or invalid chars (`../admin`). -> **DENY** (`isValidId()` regex + length guard).
6. **Spoofed Audit Log Author**: Authenticated user creating `/access_logs/{id}` with `uid: 'victim-uid'`. -> **DENY** (`incoming().uid == request.auth.uid`).
7. **Client Timestamp Forgery**: Creating `app_users`, `access_logs`, or `pqc_rooms` with backdated `createdAt`. -> **DENY** (`request.time` enforced).
8. **Immutable Field Mutation**: Updating `createdAt` or `createdByUid` on `/app_users/{userId}`. -> **DENY**.
9. **Unbounded Array Exhaustion**: Creating `/app_users/{id}` with 25 items in `allowedIcons` or non-string element `[123]`. -> **DENY** (`size() <= 20` and `[0] is string`).
10. **Invite Code Directory Scraping**: Attempting `list` query on `/pqc_invites`. -> **DENY** (`allow list: if false`).
11. **Orphaned Message Injection**: Posting `/pqc_rooms/{roomId}/messages/{msgId}` using a `senderPeerId` not belonging to `request.auth.uid` in that room. -> **DENY** (`get()` verifies peer ownership).
12. **Terminal Room Write**: Adding peer or message to a `/pqc_rooms/{roomId}` whose `status == 'closed'`. -> **DENY** (`status == 'active'` gate).
