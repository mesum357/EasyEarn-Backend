const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

let streamUpload = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        // Default upload options
        const defaultOptions = {
            resource_type: 'auto',
            quality: 'auto',
            fetch_format: 'auto',
            ...options
        };

        let stream = cloudinary.uploader.upload_stream(
            defaultOptions,
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );

        streamifier.createReadStream(buffer).pipe(stream);
    });
};

// Specialized upload functions for different content types
let uploadTaskScreenshot = (buffer) => {
    return streamUpload(buffer, {
        folder: 'easyearn/tasks',
        transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto' }
        ]
    });
};

let uploadHomepageEntry = (buffer) => {
    return streamUpload(buffer, {
        folder: 'easyearn/homepage',
        transformation: [
            { width: 1500, height: 1000, crop: 'limit' },
            { quality: 'auto' }
        ]
    });
};

let uploadDepositReceipt = (buffer) => {
    return streamUpload(buffer, {
        folder: 'easyearn/deposits',
        transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto' }
        ]
    });
};

module.exports = { 
    streamUpload, 
    uploadTaskScreenshot, 
    uploadHomepageEntry, 
    uploadDepositReceipt 
};
