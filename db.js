let UserModel = require('./models/user.model');
let MessageModel = require('./models/message.model');
let ChatModel = require('./models/chat.model');

class DBEmulator {
    constructor() {
        this.chats = [];
        this.users = [];
        this.usersOnline = [];
    }

    getFirstUser(user_data = null){
        let user = null;
        if (user_data && user_data.id) {

            return this.users.find(user => user.id == user_data.id);
        }
        return null;
    }
    createUser(user_data = null){
        let user = new UserModel(user_data);
        if(user) this.users.push(user);
        return user;
    }

    firstOrCreateUser(user_data = null) {
        let user = this.getFirstUser(user_data);
        if (! user) {
            user = this.createUser(user_data);
        }
        return user;
    }

    getFirstChat(chat_data = null){
        let chat = null;
        if (chat_data && chat_data.id) {
            chat = this.chats.find(chat => (chat.id == chat_data.id));
        }
        return chat;
    }

    createChat(chat_data = null){
        let chat = new ChatModel(chat_data);
        if(chat) this.chats.push(chat);
        return chat;
    }

    firstOrCreateChat(chat_data = null) {
        let chat = this.getFirstChat(chat_data);
        if (! chat) {
            chat = this.createChat(chat_data);
        }
        return chat;
    }

    onlineUser(user){
        if(!user) return false;
        if (this.usersOnline.find(u => u.id === user.id)) return true;
        this.usersOnline.push(user);
        return true;
    }

    offlineUser(user){
        if(! user) return false;
        this.usersOnline = this.usersOnline.filter(u => u.id !== user.id);
        return true;
    }

    seedData() {
        let chat1 = this.firstOrCreateChat({name: 'Hello Chat', isDirected: false});
        let chat2 = this.firstOrCreateChat({name: 'Smile', isDirected: false});
        this.firstOrCreateChat({name: 'test', isDirected: true});

        let user1 = this.firstOrCreateUser({
            id: 'test_user_1',
            nickname: 'test_user 1'
        });
        let user2 = this.firstOrCreateUser({
            id: 'test_user_2',
            nickname: 'test_user 2'
        });

        chat1.postMessage({user: user1, text: "Hello! Hello!"});
        chat1.postMessage({user: user1, text: "Smile!"});
        chat1.postMessage({user: user2, text: "I love You!"});
        chat2.postMessage({user: user1, text: "Test."});
        chat2.postMessage({user: user1, text: "Test_2"});


    }
};

module.exports = new DBEmulator();