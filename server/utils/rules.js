// server/utils/rules.js
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{2,4}/g;
const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const URL_REGEX = /(https?:\/\/[^\s]+)/g;
const IBAN_REGEX = /[A-Z]{2}\d{2}[A-Z0-9]{1,30}/g;

const SUSPICIOUS_PHRASES = [
  "na priv","zapłać poza","prześlij numer","nr telefonu","zadzwoń",
  "on private","pay outside","send me your phone","message me privately",
  "contact me on whatsapp"
];

function hasPhone(text){
  const m = text.match(PHONE_REGEX);
  return m && m.some(s => s.replace(/\D/g,'').length >= 6);
}

function hasEmail(text){
  return EMAIL_REGEX.test(text);
}

function hasUrl(text){
  return URL_REGEX.test(text);
}

function hasIbanLike(text){
  return IBAN_REGEX.test(text);
}

function containsSuspiciousPhrase(text){
  const t = text.toLowerCase();
  return SUSPICIOUS_PHRASES.find(p => t.includes(p)) || null;
}

/**
 * checkMessage -> returns structured result:
 * { action: 'allow'|'warn'|'block', label, reason, confidence }
 */
function checkMessage(messageText, senderMeta = {}) {
  const t = messageText || '';
  // Deterministic blocks
  if (hasPhone(t)) {
    return { action: 'block', label: 'personal_data_request', reason: 'contains_phone', confidence: 0.99 };
  }
  if (hasEmail(t)) {
    return { action: 'block', label: 'personal_data_request', reason: 'contains_email', confidence: 0.98 };
  }
  if (hasIbanLike(t)) {
    return { action: 'block', label: 'payment_scam', reason: 'contains_iban_like', confidence: 0.99 };
  }

  // Heuristic scoring for non-deterministic cases
  let confidence = 0.0;
  let label = null;
  if (hasUrl(t)) { confidence += 0.2; label = label || 'phishing_link'; }
  const phrase = containsSuspiciousPhrase(t);
  if (phrase) { confidence += 0.35; label = label || 'bypass_commission'; }

  // thresholds for warn/escalate
  if (confidence >= 0.6) {
    return { action: 'warn', label: label || 'suspicious', reason: (phrase ? 'suspicious_phrase:'+phrase : 'heuristic_url'), confidence: Number(confidence.toFixed(2)) };
  }
  return { action: 'allow', label: 'benign', reason: '', confidence: 0.0 };
}

module.exports = { checkMessage, SUSPICIOUS_PHRASES };
