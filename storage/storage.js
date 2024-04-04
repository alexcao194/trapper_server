const multer = require('multer')
const fs = require('fs')

const storageAvatar = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'users')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({storage: storageAvatar, preservePath: true})

const storage = {
    upload: upload,
}

module.exports = storage