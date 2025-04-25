const WhatsAppHelper = require('../helpers/whatsapp.helper');
const { createResponse } = require('../helpers/response.helper');

const startConnection = async (req, res) => {
	try {
		if (WhatsAppHelper.isConnected) {
			return createResponse(res, 200, 'WhatsApp connection is already active', true);
		}
		const sock = await WhatsAppHelper.initialize();
		return createResponse(res, 200, 'WhatsApp connection started successfully', true);
	} catch (error) {
		return createResponse(res, 500, 'Failed to start WhatsApp connection', error.message);
	}
}

const getQrCode = async (req, res) => {
	try {
		const qr = await WhatsAppHelper.getQR();
		return createResponse(res, 200, 'QR code retrieved successfully', qr);
	} catch (error) {
		return createResponse(res, 500, 'Failed to get QR code', error.message);
	}
}

const getStatus = async (req, res) => {
	try {
		const status = await WhatsAppHelper.getConnectionStatus();
		if (status) {
			return createResponse(res, 200, 'WhatsApp connection is active', status);
		}
		return createResponse(res, 200, 'WhatsApp connection is not active', status);
	} catch (error) {
		return createResponse(res, 500, 'Failed to get WhatsApp connection status', error.message);
	}
};


const restartConnection = async (req, res) => {
	try {
		const sock = await WhatsAppHelper.restartConnection();
		return createResponse(res, 200, 'WhatsApp connection restarted successfully', true);
	} catch (error) {
		return createResponse(res, 500, 'Failed to restart WhatsApp connection', error.message);
	}
};


module.exports = {
	getStatus,
	restartConnection,
	startConnection,
	getQrCode
};
