let MessageModel = require('./message.model');

let ChatModel_max_id = 0;

class ChatModel {

    constructor({name, isDirected} = {}) {

        this.id = this.getNewId();
        this.name = name ? name : this.id;
        this.isDirected = isDirected ? isDirected : false;
        this.mesages = [];
        this.users = [];
    }

    onlineUser(user){
        if(!user) return false;
        if (this.users.find(u => u.id === user.id)) return true;
        this.users.push(user);
        return true;
    }

    offlineUser(user){
        if(! user) return false;
        this.users = this.users.filter(u => u.id !== user.id);
        return true;
    }


    getNewId(id = null) {
        let newId = id ? id : ++ ChatModel_max_id;
        if (ChatModel_max_id < newId) {
            ChatModel_max_id = newId;
        }
        return newId;
    }

    postMessage({user, text}) {
        if (! (user && text)) return false;
        let message = new MessageModel({user, text});
        this.mesages.push(message);
        return message;
    }

    getSelfData() {
        return {id: this.id, name: this.name, isDirected: this.isDirected, users: this.users};
    }

}

module.exports = ChatModel;