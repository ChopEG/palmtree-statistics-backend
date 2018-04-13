let UserModel = require('./models/user.model');
let MessageModel = require('./models/message.model');
let ChannelModel = require('./models/channel.model');

class DBEmulator {
    constructor() {
        this.channels = [];
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

    getFirstChannel(channel_data = null){
        let channel = null;
        if (channel_data && channel_data.id) {
            channel = this.channels.find(channel => (channel.id == channel_data.id));
        }
        return channel;
    }

    createChannel(channel_data = null){
        let channel = new ChannelModel(channel_data);
        if(channel) this.channels.push(channel);
        return channel;
    }

    firstOrCreateChannel(channel_data = null) {
        let channel = this.getFirstChannel(channel_data);
        if (! channel) {
            channel = this.createChannel(channel_data);
        }
        return channel;
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
        let channel1 = this.firstOrCreateChannel({name: 'Hello Channel', isDirected: false});
        let channel2 = this.firstOrCreateChannel({name: 'Smile', isDirected: false});
        this.firstOrCreateChannel({name: 'test', isDirected: true});

        let user1 = this.firstOrCreateUser({
            id: 'test_user_1',
            nickname: 'test_user 1',
        });
        let user2 = this.firstOrCreateUser({
            id: 'test_user_2',
            nickname: 'test_user 2'
        });

        channel1.postMessage({user: user1, text: "Hello! Hello!"});
        channel1.postMessage({user: user1, text: "Smile!"});
        channel1.postMessage({user: user2, text: "I love You!"});
        channel2.postMessage({user: user1, text: "Test."});
        channel2.postMessage({user: user1, text: "Test_2"});


    }
};

module.exports = new DBEmulator();