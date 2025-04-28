function validateSendMessage(payload, file) {
    const { type, message, jid } = payload;

    if (!type || !['conversation', 'image'].includes(type)) {
        return { valid: false, error: 'Invalid or missing type. Allowed: conversation, image' };
    }

    if (!jid) {
        return { valid: false, error: 'Missing jid (WhatsApp number)' };
    }

    if (type === 'conversation' && (!message || typeof message !== 'string')) {
        return { valid: false, error: 'Missing or invalid message for conversation type' };
    }

    if (type === 'image' && (!file || typeof file !== 'object')) {
        return { valid: false, error: 'Missing uploaded file for image type' };
    }

    return { valid: true };
}

module.exports = { validateSendMessage };