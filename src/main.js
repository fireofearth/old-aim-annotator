import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import VueSocketIOExt from 'vue-socket.io-extended';
import io from 'socket.io-client';
import App from './App.vue';
import axios from './utils/axios';
import store from './store/store';
import router from './router/router';
import capture from './plugins/capture';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import './assets/bootstrap-custom.css';
import { PathViewerException } from './utils/utils';

Vue.use(BootstrapVue);

Vue.config.productionTip = false;

function getHrefValues1() {
    const regexUrl = /datasets\/(?<datasetID>[0-9]+)\/images\/(?<imageID>[0-9]+)\/annotator/g;
    const match = regexUrl.exec(window.location.href);
    if(match) {
        return { datasetID: Number(match.groups.datasetID),
            imageID: Number(match.groups.imageID) };
    } else {
        return { datasetID: null,
            imageID: null };
    }
}

function getHrefValues2() {
    const regexUrl = /webclient\/img_detail\/(?<imageID>[0-9]+)/g;
    const regexQuery = /dataset=(?<datasetID>[0-9]+)/g;
    const matchUrl = regexUrl.exec(window.location.href);
    const matchQuery = regexQuery.exec(window.location.search);
    console.log(matchUrl, matchQuery)
    if(matchUrl && matchQuery) {
        return { imageID: Number(matchUrl.groups.imageID),
            datasetID: Number(matchQuery.groups.datasetID) };
    } else {
        return { datasetID: null,
            imageID: null };
    }
}

async function run() {
    console.log('Environmental variables:');
    console.log('VUE_APP_USE_ORIGIN', process.env.VUE_APP_USE_ORIGIN);
    console.log('VUE_APP_BASE_URL', process.env.VUE_APP_BASE_URL);
    console.log('VUE_APP_USER_ID', process.env.VUE_APP_USER_ID);
    console.log('VUE_APP_DATASET_ID', process.env.VUE_APP_DATASET_ID);
    console.log('VUE_APP_IMAGE_ID', process.env.VUE_APP_IMAGE_ID, '\n');
    console.log('href is', window.location.href);
    console.log('getting parameters take #1');
    let datasetID, imageID, baseURL, userID;
    ({ datasetID, imageID } = getHrefValues2());
    if(!datasetID || !imageID) {
        console.log('getting parameters take #2');
        ({ datasetID, imageID } = getHrefValues1());
    }
    if(!datasetID || !imageID) {
        console.log('getting parameters take #3');
    }
    datasetID = process.env.VUE_APP_DATASET_ID || datasetID;
    imageID = process.env.VUE_APP_IMAGE_ID || imageID;
    if(!!process.env.VUE_APP_USE_ORIGIN) {
        let tmp = window.location.origin.split(':');
        // remove the PORT from origin if PORT exists
        baseURL = tmp.length == 2 ? tmp.join(':') : tmp.slice(0, 2).join(':');
    } else {
        baseURL = process.env.VUE_APP_BASE_URL || window.location.origin;
    }
    if(!datasetID || !imageID) {
        throw new PathViewerException('cannot initialize app!');
    }
    let res = null;
    console.log('getting user ID');
    if(!process.env.VUE_APP_USER_ID)
        res = await axios.get(`${baseURL}/aimviewer/current/user`);
    userID = process.env.VUE_APP_USER_ID || res.data.user_id;
    console.log('initializing with:');
    console.log('baseURL', baseURL);
    console.log('datasetID', datasetID);
    console.log('imageID', imageID);
    console.log('userID', userID);
    const payload = {
        appContext: {
            dataset_id: datasetID,
            image_id: imageID,
            username: null,
            user_id: userID,
        },
        config: {
            base_url: baseURL
        },
    };
    store.dispatch('initAppContext', payload);

    const query = {
        dataset_id: store.getters['dataset_id'],
        image_id: store.getters['image_id'],
        username: store.getters['username'],
        room: `${store.getters['dataset_id']} ${store.getters['image_id']}`,
    }
    // const socket = io(`${store.getters['base_url']}/socket`, { query });
    // Vue.use(VueSocketIOExt, socket, { store });
    Vue.use(capture);

    window['vue'] = new Vue({
        store,
        router,
        render: h => h(App),
    }).$mount('#app');
}

run();