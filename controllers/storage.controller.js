const storageController = {
    uploadAvatar: (req, res, next) => {
        const files = req.files
        if (!files) {
            return next()
        }
        res.send(files)
    }
}

module.exports = storageController