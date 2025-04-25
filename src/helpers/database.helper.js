const mongoose = require('mongoose');
require('dotenv').config();
const Chat = require('../models/chat.model');
const User = require('../models/user.model');

// Database connection
let isConnected = false;


const connectToDatabase = async () => {
	if (isConnected) return true;
	
	try {
		const dbUrl = process.env.DB_URL;
		
		if (!dbUrl) {
			console.error("❌ MongoDB URL not found in environment variables");
			return false;
		}
		
		await mongoose.connect(dbUrl);
		
		isConnected = true;
		console.log("✅ Connected to MongoDB");
		return true;
	} catch (error) {
		console.error("❌ MongoDB connection error:", error.message);
		return false;
	}
};


const saveChat = async (messageData) => {
	try {
		if (!isConnected) {
			await connectToDatabase();
		}
		const chatMessage = new Chat(messageData);
		const savedMessage = await chatMessage.save();
		return savedMessage;
	} catch (error) {
		console.error("❌ Failed to store message in database:", error.message);
		return null;
	}
};

const getUser = async (jid) => {
	try {
		if (!isConnected) {
			await connectToDatabase();
		}
		const user = await
		 User.findOne({ 'jid':jid });
		if (!user) {
			return null;
		}
		return user;
	}
	catch (error) {
		return null;
	}
}

const saveUser = async (userData) => {
	try {
		if (!isConnected) {
			await connectToDatabase();
		}
		const user = new User(userData);
		const savedUser = await user.save();
		return savedUser;
	} catch (error) {
		console.error("❌ Failed to store user in database:", error.message);
		return null;
	}
};

const saveUserOnce = async (userData) => {
	try {
		if (!isConnected) {
			await connectToDatabase();
		}
		const user = await User.findOne({ 'jid': userData.jid });
		if (!user) {
			const newUser = new User(userData);
			const savedUser = await newUser.save();
			return savedUser;
		}
		return user;
	}
	catch (error) {
		console.error("❌ Failed to store user in database:", error.message);
		return null;
	}
}

const getUserChats = async (jid, limit) => {
    try {
        if (!isConnected) {
            await connectToDatabase();
        }
        const user = await User.findOne({ 'jid': jid });
        if (!user) {
            return null;
        }
        
        const chats = await Chat.find({ 'from': jid }).sort({ createdAt: -1 }).limit(limit).exec();
        const userObject = user.toObject();
        userObject.chats = chats;
        
        return userObject;
    } catch (error) {
        console.error("❌ Failed to get chats:", error.message);
        return null;
    }
}

const getUserProfiles = async (has_chat = false, limit = 10) => {
    try {
        if (!isConnected) {
            await connectToDatabase();
        }
        let users;
        
        if (has_chat) {
            users = await User
                .find({})
                .sort({ updatedAt: -1 })
                .select('jid name profilePic')
                .limit(limit)
                .lean();
        } else {
            users = await User.aggregate([
                {
                    $lookup: {
                        from: "chats",
                        localField: "jid",
                        foreignField: "from",
                        as: "sentChats"
                    }
                },
                {
                    $match: {
                        "sentChats": { $not: { $size: 0 } }
                    }
                },
                {
                    $sort: { updatedAt: -1 }
                },
                {
                    $project: {
                        sentChats: 0 
                    }
                },
                {
                    $limit: limit
                }
            ]);
        }
        
        return users;
    }
    catch (error) {
        console.error("❌ Failed to get user profiles:", error.message);
        return null;
    }
}

module.exports = {
	connectToDatabase,
	saveChat,
	getUser,
	saveUser,
	saveUserOnce,
	getUserChats,
	getUserProfiles
};
