
const { createResponse } = require('../helpers/response.helper');
const {getUser, getUserProfiles} = require('../helpers/database.helper');

const getSingleUser = async (req, res) => {
    try {
        const { jid } = req.body;
        if (!jid) {
            return createResponse(res, 400, 'JID is required');
        }

        const profile = await getUser(jid);
        return createResponse(res, 200, 'User profile retrieved successfully', profile);
    } catch (error) {
        console.error('getUserProfile error:', error);
        return createResponse(res, 500, 'Failed to get user profile', error.message);
    }
};

const getAllUsers = async (req, res) => {
    try {
        const has_chat = req.query.all === 'true';
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;

        const users = await getUserProfiles(has_chat, limit);
        return createResponse(res, 200, 'Users retrieved successfully', users);
    } catch (error) {
        console.error('getAllUsers error:', error);
        return createResponse(res, 500, 'Failed to get all users', error.message);
    }
};


module.exports = {
    getSingleUser,
    getAllUsers,
};