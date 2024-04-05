const constants = Object.freeze({
    PROFILES: 'profiles',
    USERS: 'users',
    ROOMS_INFO : 'roomsInfo',
    EMAIL: 'email',
    PASSWORD: 'password',
    HOBBIES: 'hobbies',
    NAME_REGEX: /^[A-Za-zÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸưăạảấầẩẫậắằẳẵặẹẻẽềềểếệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ\s]+$/i
});

module.exports = constants;