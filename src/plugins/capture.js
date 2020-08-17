import { debug, showError, PathViewerException } from '../utils/utils'

/**
 * Capture is used to catch important Openseadragon events.
 * There is a timeout after each event capture because
 * - we don't want redundant events to get logged
 * - too many events overloads Socket.IO
 */
class Capture {
    timeout = 500;

    constructor(vm) {
        this._vm = vm;
        this.block = false;
        this.debug = false;
        this.timeoutID = null;
        this.lastAction = null;
    }

    getTime() {
        return new Date().getTime();
    }

    catch(action) {
        return;
        if(this.block && this.lastAction === action) {
            return;
        } else if(this.block && this.timeoutID) {
            // this.lastAction !== action
            window.clearTimeout(this.timeoutID);
        }
        if(this.debug && this._vm.$route.query.x) {
            debug(`Capture.catch ${action} (${this._vm.$route.query.x}, ${this._vm.$route.query.y}, ${this._vm.$route.query.z.toFixed(3)} at ${this.getTime()}`);
        }
        this._vm.$socket.client.emit('push event', 
            {...this._vm.$route.query, time: this.getTime(), action});
        this.block = true;
        this.lastAction = action;
        this.timeoutID = window.setTimeout(() => { 
            this.block = false;
        }, this.timeout);
    }
}

export default {
    install(Vue, opts) {
        /**
         * @arg {string} action
         */
        Object.defineProperty(Vue.prototype, '$capture', {
            get() {
                if (!this.$_capture) {
                    this.$_capture = new Capture(this);
                }
                return this.$_capture;
            },
        });
    }
}
