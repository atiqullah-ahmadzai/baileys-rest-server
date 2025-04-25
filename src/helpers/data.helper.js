const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');


const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};


const getDateBasedPath = () => {
    const now = new Date();
    const year = now.getFullYear();
    // Add 1 to month since getMonth() returns 0-11
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    return path.join(year.toString(), month, day);
};


const generateUniqueFileName = (originalName, extension) => {
    const timestamp = Date.now();
    const hash = crypto.createHash('md5').update(originalName + timestamp).digest('hex');
    return `${hash.substring(0, 10)}_${timestamp}.${extension}`;
};

const downloadAndSaveProfilePicture = async (url, jid) => {
    if (!url) return null;
    
    try {
        // Create base directory if it doesn't exist
        const baseDir = path.join(process.cwd(), 'data', 'profiles');
        ensureDirectoryExists(baseDir);
        
        // Create date-based directory
        const datePath = getDateBasedPath();
        const savePath = path.join(baseDir, datePath);
        ensureDirectoryExists(savePath);
        
        // Generate unique filename
        const uniqueFileName = generateUniqueFileName(jid, 'jpg');
        const fullFilePath = path.join(savePath, uniqueFileName);
        
        // Download the image
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });
        
        // Save the image
        const writer = fs.createWriteStream(fullFilePath);
        response.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(path.join('profiles', datePath, uniqueFileName)));
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`Failed to download profile picture for ${jid}:`, error?.message || error);
        return null;
    }
};

module.exports = {
    ensureDirectoryExists,
    getDateBasedPath,
    generateUniqueFileName,
    downloadAndSaveProfilePicture
};
