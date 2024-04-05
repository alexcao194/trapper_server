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
        console.log(req.user)
        var id = req.user._id
        var extension = file.originalname.split('.').pop()
        cb(null, `${id}.${extension}`)
    }
})

const upload = multer({storage: storageAvatar, preservePath: true})

const storage = {
    upload: upload,
}

module.exports = storage