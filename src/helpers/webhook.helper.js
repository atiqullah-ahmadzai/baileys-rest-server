const axios = require('axios');
const { saveChat, saveUserOnce, saveUser, getUser } = require('./database.helper');
const WhatsAppHelper = require('./whatsapp.helper');
const { downloadAndSaveProfilePicture } = require('./data.helper');
const Utils = require('./utils.helper');

const handleMessage = async (data) => {
    //console.dir(data, { depth: null });
    const { messages, type } = data;
    if (!messages || type !== "notify") return;
    const msg  = messages[0];
    if (!msg.message || msg.key.fromMe) return; // Skip messages sent by self
    

    const isGroup   = Utils.isGroup(msg.key.remoteJid);
    const from      = isGroup ? msg.key.participant : msg.key.remoteJid;
    const to        = isGroup ? msg.key.remoteJid : Utils.cleanJid(await WhatsAppHelper.getJid());
    const sender    = isGroup ? msg.key.participant : msg.key.remoteJid;
    const timestamp = Utils.convertToTimeStamp(msg.messageTimestamp);
    const msgId     = msg.key.id;
    
    const messageContent = msg.message;
    const messageType    = Object.keys(messageContent || {})[0];
    
    try {
        const content = await Utils.extractMessageContents(messageContent, messageType);
        console.log(`Message extracted:`, {type: messageType, hasFilePath: !!content.filePath});
        
        // Prepare data to send
        const chatMessage = {
            msgId: msgId,
            from: from,
            to: to,
            sender: sender,
            isGroup: isGroup,
            timestamp: timestamp,
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
    } catch (error) {
        console.error("❌ Failed to process message:", error);
    }
}


const createUsers = async (data) => {
    try {
        const msg = data.messages[0];
        const from = msg.key.remoteJid;
        const isGroup = Utils.isGroup(from);
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