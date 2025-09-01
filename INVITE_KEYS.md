# 🔑 Invite Key System

This application uses a temporary invite key system to control access during early development. This prevents unauthorized usage that could incur unexpected costs.

## 🚀 Quick Start

### Generate a new invite key:
```bash
cd backend
node scripts/generate-invite-key.js generate
```

### List all invite keys:
```bash
cd backend
node scripts/generate-invite-key.js list
```

### Deactivate a key:
```bash
cd backend
node scripts/generate-invite-key.js deactivate <key_value>
```

## 🔒 How it works

### Backend Protection
- All API routes (except `/api/health`) require a valid invite key
- Keys must be provided via:
  - Header: `x-invite-key: your_key_here`
  - Query parameter: `?inviteKey=your_key_here`
- Invalid/missing keys return `401 Unauthorized`

### Frontend Gate
- The entire frontend is gated behind an invite key input
- Valid keys are stored in localStorage
- If a key becomes invalid, users are redirected to re-enter it
- The gate has a clean, professional design

### Key Properties
- **Length**: 50 characters (cryptographically secure)
- **Format**: Alphanumeric (A-Z, a-z, 0-9)
- **Storage**: PostgreSQL database with usage tracking
- **Security**: Generated using Node.js crypto module

## 📊 Database Schema

```sql
CREATE TABLE invite_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_value VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_count INTEGER DEFAULT 0
);
```

## 🛠️ Management Commands

All management is done through the CLI script - neither frontend nor backend can generate keys.

### Generate Key
```bash
node scripts/generate-invite-key.js gen
```
**Output example:**
```
🎉 New invite key generated successfully!
📋 Key: A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0U1v2W3x4Y5z
🔐 ID: 123e4567-e89b-12d3-a456-426614174000
⏰ Created: 2024-01-15T10:30:00.000Z

⚠️  IMPORTANT: Store this key securely. It cannot be retrieved again.
💡 Users can provide this key via:
   - Header: x-invite-key
   - Query param: ?inviteKey=...
```

### List Keys
```bash
node scripts/generate-invite-key.js ls
```
**Output example:**
```
📝 All invite keys:

1. ✅ Active
   Key: A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0U1v2W3x4Y5z
   Used: 15 times
   Created: 2024-01-15T10:30:00.000Z

2. ❌ Inactive
   Key: B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8s9T0u1V2w3X4y5Z6a
   Used: 3 times
   Created: 2024-01-14T09:15:00.000Z
```

### Deactivate Key
```bash
node scripts/generate-invite-key.js disable A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0U1v2W3x4Y5z
```
**Output example:**
```
🔒 Key deactivated successfully!
📋 Key: A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0U1v2W3x4Y5z
⏰ Deactivated at: 2024-01-15T14:30:00.000Z
```

## 🔧 Easy Removal

When you're ready to remove the invite key system:

1. **Remove middleware:** Delete the `validateInviteKey` middleware from `backend/src/index.js`
2. **Remove frontend gate:** Remove `InviteKeyGate` and `InviteKeyProvider` from `frontend/src/App.js`
3. **Clean up files:** Delete these files:
   - `backend/src/middleware/inviteAuth.js`
   - `backend/scripts/generate-invite-key.js`
   - `frontend/src/contexts/InviteKeyContext.js`
   - `frontend/src/components/InviteKeyGate.js`
   - `frontend/src/components/InviteKeyGate.css`
4. **Drop table:** `DROP TABLE invite_keys;` (or just leave it, it won't hurt anything)
5. **Remove API interceptor:** Clean up the invite key logic in `frontend/src/services/api.js`

## 🛡️ Security Features

- **Cryptographically secure key generation** using Node.js crypto
- **No key exposure** in logs or error messages
- **Usage tracking** to monitor key activity
- **Proper error handling** with generic error messages
- **Automatic cleanup** of invalid keys from localStorage
- **Header-based authentication** (more secure than query params)
- **Database-level uniqueness** constraint on keys

## ⚠️ Important Notes

- **Store keys securely** - they cannot be retrieved once generated
- **Keys are permanent** - no expiration (by design for temporary system)
- **All-or-nothing access** - keys provide full application access
- **CLI-only generation** - prevents unauthorized key creation
- **Case-sensitive** - keys must be entered exactly as generated

This system provides robust protection during development while being easily removable when no longer needed.