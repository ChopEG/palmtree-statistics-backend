let express = require('express');
let socket = require('socket.io');
let eventsIO = require('./socket.events');

let app = express();

let db = require('./db');
db.seedData();


server = app.listen(5000, function () {
    console.log('server is running on port 5000')
});

io = socket(server);

io.on('connection', (socket) => {
    console.log(socket.id, JSON.parse(socket.handshake.query.user));
    let user = db.firstOrCreateUser(JSON.parse(socket.handshake.query.user));

    if(db.onlineUser(user)){
        io.emit(eventsIO.USER_ONLINE_ECHO, JSON.stringify(user));
        socket.emit(eventsIO.USERS_ONLINE_ANSWER, JSON.stringify(db.usersOnline));
    }
    else {
        return;
    }

    socket.on(eventsIO.CHANNEL_CREATE, (data) => {
        var newChannel = db.createChannel({name: data.name, isDirected: data.isDirected ? data.isDirected: false});
        io.emit(eventsIO.CHANNEL_CREATE_ECHO, JSON.stringify(newChannel.getSelfData()) );
    });

    socket.on(eventsIO.GET_ALL_CHANNELS, () => {
        let prepare = db.channels.map((channel) => {
            return channel.getSelfData();
        });
        socket.emit(eventsIO.GET_ALL_CHANNELS_ANSWER, JSON.stringify(prepare));
    });

    socket.on(eventsIO.GET_ALL_MESSAGES_FROM_CHANNEL, (data) => {
        socket.emit(eventsIO.GET_ALL_MESSAGES_FROM_CHANNEL_ANSWER, JSON.stringify(db.getFirstChannel({id: data.channel_id}).mesages))
    });

    socket.on(eventsIO.POST_MESSAGE, (data) => {
        let channel = db.firstOrCreateChannel({id: data.channel_id});
        if(! channel) return;
        let message = channel.postMessage({user, text: data.message});
        if(! message) return;
        io.emit(eventsIO.POST_MESSAGE_ECHO, JSON.stringify({channel: channel.getSelfData(), message: message}));
    });


    let disconnectUserFromChannel = (channel) => {
        if(channel.offlineUser(user)) {
            io.emit(eventsIO.USER_DISCONNECT_FROM_CHANNEL_ECHO, JSON.stringify({user: user, channel: channel.getSelfData()}) )
        }
    }

    let disconnectUserFromAllChannels = () => {
        db.channels.map( channel => disconnectUserFromChannel(channel));
    }

    socket.on('disconnect', function () {
        disconnectUserFromAllChannels();
        db.offlineUser(user);
        io.emit(eventsIO.USER_OFFLINE_ECHO, JSON.stringify(user));
    });

    socket.on(eventsIO.USER_CONNECT_TO_CHANNEL, (data) => {
        let channel = db.getFirstChannel({id: data.channel_id});
        if(! channel) return;
        if(channel.onlineUser(user)) {
            io.emit(eventsIO.USER_CONNECT_TO_CHANNEL_ECHO, JSON.stringify({user: user, channel: channel.getSelfData()}) )
        }
    });

    socket.on(eventsIO.USER_DISCONNECT_FROM_CHANNEL, (data) => {
        let channel = db.getFirstChannel({id: data.channel_id});
        if(! channel) return;
        disconnectUserFromChannel(channel);
    });

    socket.on(eventsIO.USER_SET_NEW_NAME, (data) => {
        db.offlineUser(user);
        io.emit(eventsIO.USER_OFFLINE_ECHO, JSON.stringify(user));
        disconnectUserFromAllChannels();
        user = db.createUser(data);
        if(user){
            io.emit(eventsIO.USER_SET_NEW_NAME_ANSWER, JSON.stringify(user));
            io.emit(eventsIO.USER_ONLINE_ECHO, JSON.stringify(user));
        }
    });
});

