const axios = require('axios');
const { saveChat, saveUserOnce, saveUser, getUser } = require('./database.helper');
const WhatsAppHelper = require('./whatsapp.helper');
const { downloadAndSaveProfilePicture } = require('./data.helper');

const handleMessage = async (data) => {
    const { messages, type } = data;
    if (!messages || type !== "notify") return;
    const msg  = messages[0];
    if (!msg.message || msg.key.fromMe) return; // Skip messages sent by self
    
    const from      = msg.key.remoteJid;
    const isGroup   = _isGroup(from);
    const sender    = isGroup ? msg.key.participant : msg.key.remoteJid;
    const timestamp = convertToTimeStamp(msg.messageTimestamp);
    const msgId     = msg.key.id;
    
    const messageContent = msg.message;
    const messageType    = Object.keys(messageContent || {})[0];
    
    const content = _extractMessageContent(messageContent, messageType);
    
    // Prepare data to send
    const chatMessage = {
        msgId,
        from,
        sender,
        isGroup,
        timestamp,
        sent: false,
        type: messageType,
        message: content
    };
    
    // Store in MongoDB using database helper
    try {
        await createUsers(data);
        await saveChat(chatMessage);
    } catch (err) {
        console.error("❌ Failed to store message and users in database:", err.message);
    }
    
    // Send to webhook
    try {
        if (this.webhookUrl) {
            await axios.post(this.webhookUrl, chatMessage);
        }
    } catch (err) {
        console.error("❌ Webhook failed:", err.message);
    }
}

const _extractMessageContent = (messageContent, messageType) => {
    switch (messageType) {
        case "conversation":
        return messageContent.conversation;
        
        case "extendedTextMessage":
        return messageContent.extendedTextMessage?.text || "";
        
        case "imageMessage":
        return messageContent.imageMessage?.caption || "[Image]";
        
        case "videoMessage":
        return messageContent.videoMessage?.caption || "[Video]";
        
        case "documentMessage":
        return messageContent.documentMessage?.caption || "[Document]";
        
        case "audioMessage":
        return "[Audio]";
        
        case "stickerMessage":
        return "[Sticker]";
        
        case "buttonsResponseMessage":
        return messageContent.buttonsResponseMessage?.selectedButtonId || "[Button Click]";
        
        case "listResponseMessage":
        return messageContent.listResponseMessage?.singleSelectReply?.selectedRowId || "[List Selection]";
        
        case "messageContextInfo":
        return "[Context Info]";
        
        default:
        return `[Unsupported: ${messageType}]`;
    }
}

const convertToTimeStamp = (messageTimestamp) => {
    const date = new Date(messageTimestamp * 1000); 
    return date.toISOString();
}

const createUsers = async (data) => {
    try {
        const msg = data.messages[0];
        const from = msg.key.remoteJid;
        const isGroup = _isGroup(from);
        const sender = isGroup ? msg.key.participant : msg.key.remoteJid;
        
        if (isGroup) {
            
            // Get group metadata for group name
            let groupName = 'Group';
            const groupMetadata = await WhatsAppHelper.getGroupMetadata(from);
            console.log(groupMetadata);
            groupName = groupMetadata.subject || 'Group';
            
            const checkUser = await getUser(from);
            if (!checkUser) {
                const groupProfilePic = await getAndSaveProfilePic(from);
                const group = {
                    jid: from,
                    name: groupName,
                    profileUrl: groupProfilePic.url,
                    profilePath: groupProfilePic.localPath,
                    isGroup: true,
                    groupMetadata: groupMetadata
                };
                await saveUser(group);
            }
            
            // Create user profile from participant
            const checkParticipant = await getUser(sender);
            if (!checkParticipant) {
                const userProfilePic = await getAndSaveProfilePic(sender);
                const user = {
                    jid: sender,
                    name: data.pushName || msg.pushName || 'User',
                    profileUrl: userProfilePic.url,
                    profilePath: userProfilePic.localPath,
                    isGroup: false
                };
                await saveUser(user);
            }
        } else {
            // Create only user profile
            const checkUser = await getUser(from);
            if (!checkUser) {
                const userProfilePic = await getAndSaveProfilePic(from);
                const user = {
                    jid: from,
                    name: data.pushName || msg.pushName || 'User',
                    profileUrl: userProfilePic.url,
                    profilePath: userProfilePic.localPath,
                    isGroup: false
                };
                await saveUser(user);
            }
            
        }
    } catch (error) {
        console.error("Error in createUsers:", error.message);
    }
}

const _isGroup = (from) => {
    return from.endsWith("@g.us");
}

const getAndSaveProfilePic = async (jid) => {
    try {
        const profilePictureUrl = await WhatsAppHelper.sock.profilePictureUrl(jid, 'image');
        if (profilePictureUrl) {
            const savedPath = await downloadAndSaveProfilePicture(profilePictureUrl, jid);
            return {
                url: profilePictureUrl,
                localPath: savedPath
            };
        }
        return { url: null, localPath: null };
    } catch (error) {
        console.error(`Failed to fetch profile picture for ${jid}:`, error?.message || error);
        return { url: null, localPath: null };
    }
};

module.exports = {
    handleMessage,
};