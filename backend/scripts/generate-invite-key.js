#!/usr/bin/env node

require('dotenv').config();
const crypto = require('crypto');
const db = require('../src/utils/database');

const generateSecureKey = (length = 50) => {
  // Generate a secure random string using crypto
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  
  return result;
};

const generateInviteKey = async () => {
  try {
    const keyValue = generateSecureKey(50);
    
    const result = await db.query(
      'INSERT INTO invite_keys (key_value) VALUES ($1) RETURNING *',
      [keyValue]
    );
    
    console.log('🎉 New invite key generated successfully!');
    console.log('📋 Key:', keyValue);
    console.log('🔐 ID:', result.rows[0].id);
    console.log('⏰ Created:', result.rows[0].created_at);
    console.log('');
    console.log('⚠️  IMPORTANT: Store this key securely. It cannot be retrieved again.');
    console.log('💡 Users can provide this key via:');
    console.log('   - Header: x-invite-key');
    console.log('   - Query param: ?inviteKey=...');
    
  } catch (error) {
    console.error('❌ Error generating invite key:', error.message);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
};

const listKeys = async () => {
  try {
    const result = await db.query(
      'SELECT id, key_value, is_active, created_at, used_count FROM invite_keys ORDER BY created_at DESC'
    );
    
    console.log('📝 All invite keys:');
    console.log('');
    
    if (result.rows.length === 0) {
      console.log('   No invite keys found.');
      return;
    }
    
    result.rows.forEach((key, index) => {
      const status = key.is_active ? '✅ Active' : '❌ Inactive';
      console.log(`${index + 1}. ${status}`);
      console.log(`   Key: ${key.key_value}`);
      console.log(`   Used: ${key.used_count} times`);
      console.log(`   Created: ${key.created_at}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error listing keys:', error.message);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
};

const deactivateKey = async (keyValue) => {
  try {
    const result = await db.query(
      'UPDATE invite_keys SET is_active = false WHERE key_value = $1 RETURNING *',
      [keyValue]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Key not found:', keyValue);
      return;
    }
    
    console.log('🔒 Key deactivated successfully!');
    console.log('📋 Key:', result.rows[0].key_value);
    console.log('⏰ Deactivated at:', new Date().toISOString());
    
  } catch (error) {
    console.error('❌ Error deactivating key:', error.message);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
};

// Parse command line arguments
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case 'generate':
  case 'gen':
    generateInviteKey();
    break;
  case 'list':
  case 'ls':
    listKeys();
    break;
  case 'deactivate':
  case 'disable':
    if (!arg) {
      console.log('❌ Please provide the key to deactivate');
      console.log('Usage: node generate-invite-key.js deactivate <key>');
      process.exit(1);
    }
    deactivateKey(arg);
    break;
  default:
    console.log('🔑 Wiki RPG Invite Key Manager');
    console.log('');
    console.log('Usage:');
    console.log('  node generate-invite-key.js generate     Generate a new invite key');
    console.log('  node generate-invite-key.js list         List all invite keys');
    console.log('  node generate-invite-key.js deactivate <key>  Deactivate a key');
    console.log('');
    console.log('Aliases:');
    console.log('  gen, ls, disable');
    process.exit(0);
}