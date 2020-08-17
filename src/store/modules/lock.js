/**
 * Locks for async actions
 */
const lock = {
    namespaced: true,
    state: {
        lock: false,
    },
    getters: {
        isLocked: state => state.lock,
        isUnlocked: state => !state.lock,
    },
    mutations: {
        acquire(state) {
            state.lock = true;
        },
        release(state) {
            state.lock = false;
        },
    },
    actions: {
        acquire(context) {
            context.commit('acquire');
        },
        release(context) {
            context.commit('release');
        },
    },
};

export default lock;