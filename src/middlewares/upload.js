const multer = require('multer');
const path = require('path');

// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join('public', 'img', 'documents'));  // Destination folder
    },
    filename: (req, file, cb) => {
        // Get the file extension from the original file
        const ext = path.extname(file.originalname).toLowerCase();
    
        // Check if the extension is valid
        if (!ext) {
            return cb(new Error('Invalid file extension'), false);
        }
    
        // Generate a unique file name using the timestamp, random number, and the file extension
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    
        // Set the final filename
        cb(null, uniqueSuffix);
    }
    
    
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
    }
};

// Configure multer with the storage and file filter
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
})

module.exports = upload;
