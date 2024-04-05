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
    }
}

module.exports = storageController