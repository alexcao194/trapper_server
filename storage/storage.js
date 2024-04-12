const multer = require('multer')
const fs = require('fs')

const storageAvatar = multer.diskStorage({
    destination: function(req, file, cb) {
        const path = 'data/avatar'
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true })
        }
        cb(null, path)
    },
    filename: function(req, file, cb) {
        var id = req.user._id
        var extension = file.originalname.split('.').pop()
        var date = new Date()
        cb(null, `${id}-${date.getTime()}.${extension}`)
    }
})

const storageProfile = multer.diskStorage({
    destination: function(req, file, cb) {
        var id = req.user._id
        const path = `data/profile/${id}`
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true })
        }
        cb(null, path)
    },
    filename: function(req, file, cb) {
        var id = req.user._id
        var index = req.body.index
        var extension = file.originalname.split('.').pop()
        var date = new Date()
        cb(null, `${index}-${id}-${date.getTime()}.${extension}`)
    }
})

const avatarUpload = multer({storage: storageAvatar, preservePath: true})
const profileUpload = multer({storage: storageProfile, preservePath: true})

// read all files from data/profile/id 
function readAllFiles(id, dir) {
    const path = `${dir}/${id}`
    if (!fs.existsSync(path)) {
        return []
    }
    return fs.readdirSync(path).map(file => {
        return `${path}/${file}`
    })
}

// file name format: index-id-timestamp.extension
// get a newest file with each index
function getNewestPhotos(id) {
    const map = {}
    var files = readAllFiles(id, 'data/profile')
    files.forEach(file => {
        const index = file.split('/')[3].split('-')[0]
        const timestamp = file.split('/')[3].split('-')[6].split('.')[0]
        if (!map[index] || map[index].timestamp < timestamp) {
            map[index] = {
                file: file,
                timestamp: timestamp
            }
        }
    })
    return Object.values(map).map(item => item.file)
}

function getAvatar(id) {
    var files = readAllFiles(id, 'data/avatar')
    for (var i = 0; i < files.length; i++) {
        if (files[i].includes(id)) {
            return files[i]
        }
    }
    return null

}

const storage = {
    avatarUpload: avatarUpload,
    profileUpload: profileUpload,
    readAllFiles: readAllFiles,
    getNewestPhotos: getNewestPhotos,
    getAvatar: getAvatar
}

module.exports = storage