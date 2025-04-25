// whatsapp.helper.js

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode");

class BayleysClass {
    constructor(config = {}) {
        this.sock = null;
        this.qrCodeData = null;
        this.webhookUrl = config.webhookUrl || process.env.WEBHOOK_URL;
        this.authPath = config.authPath || ".auth_info";
        this.isConnected = false;
    }
    
    async initialize() {
        try {
            const { state, saveCreds } = await useMultiFileAuthState(this.authPath);
            
            this.sock = makeWASocket({
                auth: state,
                printQRInTerminal: true,
            });
            
            // Set up event handlers
            this._setupEventHandlers(saveCreds);
            
            return this.sock;
        } catch (error) {
            console.error("Failed to initialize WhatsApp connection:", error);
            throw error;
        }
    }
    
    _setupEventHandlers(saveCreds) {
        // Handle credential updates
        this.sock.ev.on("creds.update", saveCreds);
        
        // Handle connection state changes
        this.sock.ev.on("connection.update", async (update) => {
            this._handleConnectionUpdate(update);
        });
        
        // Handle incoming messages
        this.sock.ev.on("messages.upsert", async (data) => {

            // Use require here to avoid circular dependency
            const { handleMessage } = require('../helpers/webhook.helper');
            handleMessage(data);
        });
    }
    
    async _handleConnectionUpdate(update) {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            try {
                this.qrCodeData = await qrcode.toDataURL(qr);
            } catch (error) {
                //console.error("Failed to generate QR code:", error);
            }
        }
        
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
            //console.log("Disconnected:", lastDisconnect?.error);
            this.isConnected = false;
            
            if (shouldReconnect) {
                //console.log("Reconnecting...");
                this.initialize();
            }
        }
        
        if (connection === "open") {
            //console.log("✅ WhatsApp connected!");
            this.qrCodeData = null; // clear QR once connected
            this.isConnected = true;
        }
    }
    
    
    async getQR() {
        return this.qrCodeData;
    }
    
    async sendMessage(jid, text) {
        if (!this.sock) {
            await this.initialize();
        }
        
        try {
            return await this.sock.sendMessage(jid, { text });
        } catch (error) {
            //console.error("Failed to send message:", error);
            throw error;
        }
    }
    
    async getAllGroups() {
        if (!this.sock) {
            await this.initialize();
        }
        
        try {
            const groupsObj = await this.sock.groupFetchAllParticipating();
            const groups = Object.entries(groupsObj).map(([id, group]) => ({
                name: group.subject,
                id: id
            }));
            
            return groups;
        } catch (error) {
            console.error("Failed to fetch groups:", error);
            throw error;
        }
    }
    
    async getAllChats() {
        if (!this.sock) {
            await this.initialize();
        }
        
        try {
            const chats = await this.sock.chats.all();
            return chats;
        } catch (error) {
            //console.error("Failed to fetch chats:", error);
            throw error;
        }
    }
    
    getConnectionStatus() {
        return this.isConnected;
    }
    
    restartConnection() {
        if (this.sock) {
            this.sock.ws.close();
            this.sock = null;
        }
        return this.initialize();
    }

    async getProfileUrl(jid) {
        try {
            const profilePicture = await this.sock.profilePictureUrl(jid, 'image');
            return {
                jid,
                profile_picture: profilePicture,
            };
    
        } catch (error) {
            console.error(`Failed to fetch full profile for ${jid}:`, error?.message || error);
            return {
                jid,
                profile_picture: null,
            };
        }
    }

    async getGroupMetadata (jid) {
        try {
            const groupMetaData = await this.sock.groupMetadata(jid);
            return groupMetaData;
        } catch (error) {
            console.error(`Failed to fetch group metadata for ${jid}:`, error?.message || error);
            return {};
        }
    }

    async getJid() {
        if (!this.sock) {
            await this.initialize();
        }
        return this.sock.user.id;
    }

    
}

// Create a singleton instance
const WhatsAppHelper = new BayleysClass();

module.exports = WhatsAppHelper;
