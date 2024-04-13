const CHAT_EVENT = Object.freeze({
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    ERROR: 'error',
    
    FETCH_ROOMS_INFO: 'on_fetch_rooms_info',
    RECEIVED_ROOMS_INFO: 'on_received_rooms_info',

    FETCH_ROOMS_MESSAGES: 'on_fetch_rooms_messages',
    RECEIVED_ROOMS_MESSAGES: 'on_received_rooms_messages',

    SEND_MESSAGE: 'on_send_message',
    RECEIVED_MESSAGE: 'on_received_message',
});

module.exports = CHAT_EVENT;