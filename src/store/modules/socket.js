import { debug } from '../../utils/utils';

const socket = {
    namespaced: true,
    state: {
        comments: []
    },
    getters: {
        comments: state => state.comments,
    },
    mutations: {
        'SOCKET_NOTIFY COMMENT'(state, payload) {
            state.comments.push(payload);
        }
    },
    actions: {
        pushComment(context, message) {
            debug('message=' + message);
            this._vm.$socket.client.emit('push comment', message);
        },
    },
};

export default socket;