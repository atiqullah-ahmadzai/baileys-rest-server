const dataHelper = require('./data.helper');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const WhatsAppHelper = require('./whatsapp.helper');
const { saveChatMediaFile } = require('./data.helper');

class UtilsHelper {

    cleanJid (jid) {
        if (!jid) return '';
        if (jid.includes(':')) {
            return jid.split(':')[0] + '@' + jid.split('@')[1];
        }
        return jid;
    }
    
    async extractMessageContents(messageContent, messageType) {
        const baseResult = {
            type: messageType,
            content: "",
            caption: "",
            filePath: null,
            mimetype: null,
            fileName: null,
            fileLength: null
        };
        
        switch (messageType) {
            case "conversation":
                return {
                    ...baseResult,
                    content: messageContent.conversation || ""
                };
            
            case "extendedTextMessage":
                return {
                    ...baseResult,
                    content: messageContent.extendedTextMessage?.text || ""
                };
            
            case "imageMessage": {
                const imgMsg = messageContent.imageMessage;
                const caption = imgMsg?.caption || "";
                let filePath = null;
                
                if (imgMsg?.url) {
                    try {
                        const buffer = await this.downloadMediaFile(imgMsg);
                        if (buffer) {
                            const { filePath: savedFilePath, fullPath } = await dataHelper.saveChatMediaFile(
                                buffer, 
                                'image', 
                                {
                                    mimetype: imgMsg?.mimetype || "image/jpeg",
                                    fileLength: imgMsg?.fileLength?.low || 0
                                }
                            );
                            filePath = savedFilePath;
                            console.log(`Image saved to: ${fullPath}`);
                        }
                    } catch (error) {
                        console.error("Error saving image file:", error);
                    }
                }
                
                return {
                    ...baseResult,
                    content: "[Image]",
                    caption,
                    filePath,
                    mimetype: imgMsg?.mimetype || "image/jpeg",
                    fileLength: imgMsg?.fileLength?.low || 0,
                    mediaUrl: imgMsg?.url || null,
                    width: imgMsg?.width || 0,
                    height: imgMsg?.height || 0
                };
            }
            
            case "videoMessage": {
                const vidMsg = messageContent.videoMessage;
                const caption = vidMsg?.caption || "";
                let filePath = null;
                
                if (vidMsg?.url) {
                    try {
                        const buffer = await this.downloadMediaFile(vidMsg);
                        if (buffer) {
                            const { filePath: savedFilePath, fullPath } = await dataHelper.saveChatMediaFile(
                                buffer, 
                                'video', 
                                {
                                    mimetype: vidMsg?.mimetype || "video/mp4",
                                    fileLength: vidMsg?.fileLength?.low || 0
                                }
                            );
                            filePath = savedFilePath;
                            console.log(`Video saved to: ${fullPath}`);
                        }
                    } catch (error) {
                        console.error("Error saving video file:", error);
                    }
                }
                
                return {
                    ...baseResult,
                    content: "[Video]",
                    caption,
                    filePath,
                    mimetype: vidMsg?.mimetype || "video/mp4",
                    fileLength: vidMsg?.fileLength?.low || 0,
                    mediaUrl: vidMsg?.url || null,
                    seconds: vidMsg?.seconds || 0
                };
            }
            
            case "documentMessage": {
                const docMsg = messageContent.documentMessage;
                const caption = docMsg?.caption || "";
                let filePath = null;
                
                if (docMsg?.url) {
                    try {
                        const buffer = await this.downloadMediaFile(docMsg);
                        if (buffer) {
                            const { filePath: savedFilePath, fullPath } = await dataHelper.saveChatMediaFile(
                                buffer, 
                                'document', 
                                {
                                    mimetype: docMsg?.mimetype || "application/octet-stream",
                                    fileLength: docMsg?.fileLength?.low || 0,
                                    fileName: docMsg?.fileName || 'document'
                                }
                            );
                            filePath = savedFilePath;
                            console.log(`Document saved to: ${fullPath}`);
                        }
                    } catch (error) {
                        console.error("Error saving document file:", error);
                    }
                }
                
                return {
                    ...baseResult,
                    content: "[Document]",
                    caption,
                    filePath,
                    fileName: docMsg?.fileName || null,
                    mimetype: docMsg?.mimetype || "application/octet-stream",
                    fileLength: docMsg?.fileLength?.low || 0,
                    mediaUrl: docMsg?.url || null
                };
            }
            
            case "audioMessage": {
                const audioMsg = messageContent.audioMessage;
                let filePath = null;
                
                if (audioMsg?.url) {
                    try {
                        const buffer = await this.downloadMediaFile(audioMsg);
                        if (buffer) {
                            const { filePath: savedFilePath, fullPath } = await dataHelper.saveChatMediaFile(
                                buffer, 
                                'audio', 
                                {
                                    mimetype: audioMsg?.mimetype || "audio/ogg",
                                    fileLength: audioMsg?.fileLength?.low || 0
                                }
                            );
                            filePath = savedFilePath;
                            console.log(`Audio saved to: ${fullPath}`);
                        }
                    } catch (error) {
                        console.error("Error saving audio file:", error);
                    }
                }
                
                return {
                    ...baseResult,
                    content: "[Audio]",
                    filePath,
                    mimetype: audioMsg?.mimetype || "audio/ogg",
                    fileLength: audioMsg?.fileLength?.low || 0,
                    mediaUrl: audioMsg?.url || null,
                    seconds: audioMsg?.seconds || 0,
                    ptt: audioMsg?.ptt || false
                };
            }
            
            case "stickerMessage": {
                const stickerMsg = messageContent.stickerMessage;
                let filePath = null;
                
                if (stickerMsg?.url) {
                    try {
                        const buffer = await this.downloadMediaFile(stickerMsg);
                        if (buffer) {
                            const { filePath: savedFilePath, fullPath } = await dataHelper.saveChatMediaFile(
                                buffer, 
                                'sticker', 
                                {
                                    mimetype: stickerMsg?.mimetype || "image/webp",
                                    fileLength: stickerMsg?.fileLength?.low || 0
                                }
                            );
                            filePath = savedFilePath;
                            console.log(`Sticker saved to: ${fullPath}`);
                        }
                    } catch (error) {
                        console.error("Error saving sticker file:", error);
                    }
                }
                
                return {
                    ...baseResult,
                    content: "[Sticker]",
                    filePath,
                    mimetype: stickerMsg?.mimetype || "image/webp",
                    fileLength: stickerMsg?.fileLength?.low || 0,
                    mediaUrl: stickerMsg?.url || null
                };
            }
            
            case "buttonsResponseMessage":
                return {
                    ...baseResult,
                    content: messageContent.buttonsResponseMessage?.selectedButtonId || "",
                    buttonText: messageContent.buttonsResponseMessage?.selectedDisplayText || "[Button Click]",
                    type: "buttonResponse"
                };
            
            case "listResponseMessage":
                return {
                    ...baseResult,
                    content: messageContent.listResponseMessage?.singleSelectReply?.selectedRowId || "",
                    listTitle: messageContent.listResponseMessage?.title || "",
                    listDescription: messageContent.listResponseMessage?.description || "",
                    type: "listResponse"
                };
            
            case "messageContextInfo":
                return {
                    ...baseResult,
                    content: "[Context Info]"
                };
            
            default:
                return {
                    ...baseResult,
                    content: `[Unsupported: ${messageType}]`
                };
        }
    }
    
    async downloadMediaFile(msg) {
        try {
            let mediaType;
            if (msg.mimetype) {
                const mimePrefix = msg.mimetype.split('/')[0];
                if (mimePrefix === 'image') mediaType = 'image';
                else if (mimePrefix === 'video') mediaType = 'video';
                else if (mimePrefix === 'audio') mediaType = 'audio';
                else if (mimePrefix === 'application' || mimePrefix === 'text') mediaType = 'document';
                else mediaType = 'document'; 
            } else {
                if ('imageMessage' in msg) mediaType = 'image';
                else if ('videoMessage' in msg) mediaType = 'video';
                else if ('audioMessage' in msg) mediaType = 'audio';
                else if ('documentMessage' in msg) mediaType = 'document';
                else if ('stickerMessage' in msg) mediaType = 'sticker';
            }
            
            const baileysMsgObject = { message: {} };
            baileysMsgObject.message[`${mediaType}Message`] = msg;
            const buffer = await WhatsAppHelper.downloadMedia(baileysMsgObject, mediaType);
            
            if (!buffer) {
                throw new Error(`Failed to download ${mediaType} media`);
            }
            
            return buffer;
        } catch (error) {
            console.error(`Failed to download media file:`, error?.message || error);
            return null;
        }
    }

    convertToTimeStamp (messageTimestamp) {
        const date = new Date(messageTimestamp * 1000); 
        return date.toISOString();
    }

    isGroup (from){
        return from.endsWith("@g.us");
    }
}
const Utils = new UtilsHelper();
module.exports = Utils;

