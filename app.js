let express = require('express');
let socket = require('socket.io');
let eventsIO = require('./socket.events');

let app = express();

let db = require('./db');
db.seedData();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, function () {
    console.log(`Server is running on port ${ PORT }`)
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
        var newChannel = db.createChat({name: data.name, isDirected: data.isDirected ? data.isDirected: false});
        io.emit(eventsIO.CHANNEL_CREATED, JSON.stringify(newChannel.getSelfData()) );
    });

    socket.on(eventsIO.GET_ALL_CHANNELS, () => {
        let prepare = db.chats.map((chat) => {
            return chat.getSelfData();
        });
        socket.emit(eventsIO.GET_ALL_CHANNELS_ANSWER, JSON.stringify(prepare));
    });

    socket.on(eventsIO.GET_ALL_MESSAGES_FROM_CHANNEL, (data) => {
        socket.emit(eventsIO.GET_ALL_MESSAGES_FROM_CHANNEL_ANSWER, JSON.stringify(db.getFirstChat({id: data.chat_id}).mesages))
    });

    socket.on(eventsIO.POST_MESSAGE, (data) => {
        let chat = db.firstOrCreateChat({id: data.chat_id});
        if(! chat) return;
        let message = chat.postMessage({user, text: data.message});
        if(! message) return;
        io.emit(eventsIO.POST_MESSAGE_ECHO, JSON.stringify({channel: chat.getSelfData(), message: message}));
    });


    let disconnectUserFromChat = (chat) => {
        if(chat.offlineUser(user)) {
            io.emit(eventsIO.USER_DISCONNECT_FROM_CHAT_ECHO, JSON.stringify({user: user, chat: chat.getSelfData()}) )
        }
    }

    let disconnectUserFromAllChats = () => {
        db.chats.map( chat => disconnectUserFromChat(chat));
    }

    socket.on('disconnect', function () {
        disconnectUserFromAllChats();
        db.offlineUser(user);
        io.emit(eventsIO.USER_OFFLINE_ECHO, JSON.stringify(user));
    });

    socket.on(eventsIO.USER_CONNECT_TO_CHAT, (data) => {
        let chat = db.getFirstChat({id: data.chat_id});
        if(! chat) return;
        if(chat.onlineUser(user)) {
            io.emit(eventsIO.USER_CONNECT_TO_CHAT_ECHO, JSON.stringify({user: user, chat: chat.getSelfData()}) )
        }
    });

    socket.on(eventsIO.USER_DISCONNECT_FROM_CHAT, (data) => {
        let chat = db.getFirstChat({id: data.chat_id});
        if(! chat) return;
        disconnectUserFromChat(chat);
    });

    socket.on(eventsIO.USER_SET_NEW_NAME, (data) => {
        db.offlineUser(user);
        io.emit(eventsIO.USER_OFFLINE_ECHO, JSON.stringify(user));
        disconnectUserFromAllChats();
        user = db.createUser(data);
        if(user){
            io.emit(eventsIO.USER_SET_NEW_NAME_ANSWER, JSON.stringify(user));
            io.emit(eventsIO.USER_ONLINE_ECHO, JSON.stringify(user));
        }
    });
});

