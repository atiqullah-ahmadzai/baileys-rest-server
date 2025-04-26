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

const saveChatMediaFile = async (buffer, mediaType, mediaDetails) => {
    try {
        // Determine directory based on media type
        let mediaDir;
        let extension;
        
        switch (mediaType) {
            case 'image':
                mediaDir = 'images';
                extension = (mediaDetails?.mimetype?.split('/')[1] || 'jpg');
                break;
            case 'video':
                mediaDir = 'videos';
                extension = (mediaDetails?.mimetype?.split('/')[1] || 'mp4');
                break;
            case 'audio':
                mediaDir = 'audio';
                extension = ((mediaDetails?.mimetype?.split('/')[1] || '').split(';')[0] || 'ogg');
                break;
            case 'document':
                mediaDir = 'documents';
                if (mediaDetails?.fileName && mediaDetails.fileName.includes('.')) {
                    extension = mediaDetails.fileName.split('.').pop();
                } else {
                    extension = (mediaDetails?.mimetype?.split('/')[1] || 'bin');
                }
                break;
            case 'sticker':
                mediaDir = 'stickers';
                extension = 'webp';
                break;
            default:
                mediaDir = 'other';
                extension = 'bin';
        }

        // Create base directory
        const baseDir = path.join(process.cwd(), 'data', mediaDir);
        ensureDirectoryExists(baseDir);
        
        // Create date-based directory
        const datePath = getDateBasedPath();
        const savePath = path.join(baseDir, datePath);
        ensureDirectoryExists(savePath);
        
        // Generate unique filename
        const fileIdentifier = mediaDetails?.fileLength?.toString() || 
                               mediaDetails?.fileName || 
                               `${mediaType}-${Date.now()}`;
        
        const uniqueFileName = generateUniqueFileName(fileIdentifier, extension);
        const fullFilePath = path.join(savePath, uniqueFileName);
        
        // Save buffer to file
        await fs.promises.writeFile(fullFilePath, buffer);
        
        // Return relative file path for database storage
        return {
            filePath: path.join(mediaDir, datePath, uniqueFileName),
            fullPath: fullFilePath
        };
    } catch (error) {
        console.error(`Error saving ${mediaType} file:`, error);
        return {
            filePath: null,
            fullPath: null
        };
    }
};

module.exports = {
    ensureDirectoryExists,
    getDateBasedPath,
    generateUniqueFileName,
    downloadAndSaveProfilePicture,
    saveChatMediaFile
};
