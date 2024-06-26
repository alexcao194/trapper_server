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

    FRIEND_REQUEST: 'on_friend_request',
    RECEIVED_FRIEND_REQUEST: 'on_received_friend_request',
    ACCEPT_FRIEND_REQUEST: 'on_accept_friend_request',

    FRIEND_OFFLINE : 'on_friend_offline',
    FRIEND_ONLINE : 'on_friend_online',

    ON_FIND: 'on_find',
    ON_FOUND: 'on_found',
    ON_FIND_CANCEL: 'on_find_cancel',
});

module.exports = CHAT_EVENT;