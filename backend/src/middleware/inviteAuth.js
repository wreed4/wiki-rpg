const db = require('../utils/database');

const validateInviteKey = async (req, res, next) => {
  // Skip validation for health check and image routes
  // Note: req.path is relative to the mounted middleware, so it doesn't include '/api'
  if (req.path === '/health' || 
      req.path.startsWith('/characters/images/') ||
      req.path.startsWith('/characters/placeholder-avatar/')) {
    return next();
  }

  const inviteKey = req.headers['x-invite-key'] || req.query.inviteKey;

  if (!inviteKey) {
    return res.status(401).json({ 
      error: 'Invite key required',
      message: 'Please provide a valid invite key to access this service'
    });
  }

  try {
    const result = await db.query(
      'SELECT id, is_active FROM invite_keys WHERE key_value = $1 AND is_active = true',
      [inviteKey]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid invite key',
        message: 'The provided invite key is invalid or has been deactivated'
      });
    }

    // Increment usage count
    await db.query(
      'UPDATE invite_keys SET used_count = used_count + 1 WHERE id = $1',
      [result.rows[0].id]
    );

    next();
  } catch (error) {
    console.error('Invite key validation error:', error);
    return res.status(500).json({ 
      error: 'Authentication error',
      message: 'Unable to validate invite key'
    });
  }
};

module.exports = validateInviteKey;