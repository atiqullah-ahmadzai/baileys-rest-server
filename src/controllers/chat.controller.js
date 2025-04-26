const WhatsAppHelper = require('../helpers/whatsapp.helper');
const { createResponse } = require('../helpers/response.helper');
const {getUserChats, saveChat} = require('../helpers/database.helper');
const Utils = require('../helpers/utils.helper');

const getChats = async (req, res) => {
    const { jid, limit } = req.body;
    if (!jid) {
        return createResponse(res, 400, 'JID is required');
    }
    try {
        const chats = await getUserChats(jid, limit || 10);
        return createResponse(res, 200, 'Chats retrieved successfully', chats);
    } catch (error) {
        return createResponse(res, 500, 'Failed to get chats', error.message);
    }
}

const sendMessage = async (req, res) => {
    const { jid, message } = req.body;
    if (!jid || !message) {
        return createResponse(res, 400, 'JID and message are required');
    }
    try {
        const response = await WhatsAppHelper.sendMessage(jid, message);
        const userJid  = await WhatsAppHelper.getJid()
        const sender   = Utils.cleanJid(userJid);

        chatPayload = {
            msgId: response.key.id,
            from: sender,
            to: jid,
            sender: sender,
            message: message,
            sent: true,
            isGroup: false,
            type: 'conversation',
            timestamp: new Date(),
        };
        const chat = await saveChat(chatPayload);

        return createResponse(res, 200, 'Message sent successfully', response);
    } catch (error) {
        return createResponse(res, 500, 'Failed to send message', error.message);
    }
}

module.exports = {
    getChats,
    sendMessage
};