const fakeData = {
    "id": 1,
    "username": "test",
    "email": "a@yopmail.com",
    "name": "Test User",
    "age": 25,
    "gender": true,
    "country": "India",
    "interests": [
        "cars",
        "cats",
        "netflix and chill",
        "coding",
        "gaming"
    ]
}

const profileController = {
    getProfile: (req, res) => {
        res.send(fakeData);
    },
};

module.exports = profileController;
