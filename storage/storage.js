const multer = require('multer')
const fs = require('fs')

const storageAvatar = multer.diskStorage({
    destination: function(req, file, cb) {
        const path = 'data/avatar'
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true })
        }
        cb(null, 'data/avatar')
    },
    filename: function(req, file, cb) {
        var id = req.user._id
        var extension = file.originalname.split('.').pop()
        var date = new Date()
        cb(null, `${id}-${date.getTime()}.${extension}`)
    }
})

const upload = multer({storage: storageAvatar, preservePath: true})

const storage = {
    upload: upload,
}

module.exports = storage