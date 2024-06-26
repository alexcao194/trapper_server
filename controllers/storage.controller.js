const storage = require('../storage/storage')

const storageController = {
    uploadAvatar: (req, res, next) => {
        const file = req.file
        if (!file) {
            const error = new Error("file-invalid");
            error.httpStatusCode = 400;
            return next(error);
        }
        res.send({
            uploaded: true,
            photo_url: file.path
        })
    },

    uploadProfile: (req, res, next) => {
        const file = req.file
        const id = req.user._id
        if (!file) {
            const error = new Error("file-invalid");
            error.httpStatusCode = 400;
            return next(error);
        }
        res.send({
            uploaded: true,
            photos: storage.getNewestPhotos(id),
            photo_url: file.path
        })
    },

    sendImageMessage: (req, res, next) => {
        const file = req.file
        if (!file) {
            const error = new Error("file-invalid");
            error.httpStatusCode = 400;
            return next(error);
        }
        res.send({
            uploaded: true,
            photo_url: file.path
        })
    }
}



module.exports = storageController