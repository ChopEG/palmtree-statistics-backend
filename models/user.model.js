class UserModel {
    constructor(user_arr) {
        this.nickname = user_arr.nickname ? user_arr.nickname : "NoName";
        this.email = user_arr.email ? user_arr.email : undefined;
        this.id = this.getNewId(user_arr.id)
    }

    getNewId(id = null) {
        return id ? id : 'user_' + (Math.floor(Math.random() * (1000001)) + 1000000);
    }
}

module.exports = UserModel;