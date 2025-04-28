const WhatsAppHelper = require('../helpers/whatsapp.helper');
const { createResponse } = require('../helpers/response.helper');
const {getUserChats, saveChat} = require('../helpers/database.helper');
const Utils = require('../helpers/utils.helper');
const {validateSendMessage} = require('../validators/chat.validator');
const fs = require('fs');
const {handleMessage} = require('../helpers/webhook.helper');

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
    const file = req.file;
    const { jid, message, type } = req.body;

    const validation = validateSendMessage(req.body, file);
    if (!validation.valid) {
        return createResponse(res, 400, validation.error);
    }

    try {
        let response = {};
        const user = await WhatsAppHelper.sock.user;
        if (type === 'conversation') {
            response = await WhatsAppHelper.sock.sendMessage(jid, { text: message });
        } else if (type === 'image') {
            response = await WhatsAppHelper.sock.sendMessage(jid, {
                image: file.buffer,
                caption: message || '',
                mimetype: file.mimetype
            });
        }
        
        // Format the response to the required structure before passing to handleMessage
        const newKey = Object.assign({}, response.key, { participant: Utils.cleanJid(await WhatsAppHelper.getJid()) });
        let newMessage = {"conversation":message};

        if (type === 'image') {
            newMessage = {
                imageMessage: {
                    url: response.imageMessage.url,
                    caption: message || '',
                    mimetype: file.mimetype,
                    fileLength: file.size,
                    fileName: file.originalname
                }
            };
        }
        const formattedResponse = {
            messages: [
                {
                    key: newKey,
                    messageTimestamp: response.messageTimestamp || Math.floor(Date.now() / 1000),
                    pushName: user.name || 'Unknown',
                    broadcast: false,
                    message: newMessage
                }
            ],
            type: 'notify'
        };
        
        handleMessage(formattedResponse, true);
        return createResponse(res, 200, 'Message sent successfully', formattedResponse);
    } catch (error) {
        return createResponse(res, 500, 'Failed to send message', error.message);
    }
}

module.exports = {
    getChats,
    sendMessage
};