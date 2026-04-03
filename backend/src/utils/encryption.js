/**
 * Encryption Utility
 * AES-256 encryption for storing sensitive tokens (OAuth access/refresh tokens).
 */
const CryptoJS = require('crypto-js');
const { encryptionKey } = require('../config/env');

/**
 * Encrypt a string value
 * @param {string} text - Plain text to encrypt
 * @returns {string} Encrypted string
 */
const encrypt = (text) => {
  if (!text) return text;
  return CryptoJS.AES.encrypt(text, encryptionKey).toString();
};

/**
 * Decrypt an encrypted string
 * @param {string} cipherText - Encrypted text
 * @returns {string} Decrypted plain text
 */
const decrypt = (cipherText) => {
  if (!cipherText) return cipherText;
  const bytes = CryptoJS.AES.decrypt(cipherText, encryptionKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = { encrypt, decrypt };
