/**
 * @module store/store
 */
import Vue from 'vue';
import Vuex from 'vuex';
import paper from 'paper';
import lock from './modules/lock';
import socket from './modules/socket';
import { debug, showError } from '../utils/utils';

Vue.use(Vuex);

/**
 * @typedef Label
 * @type {object}
 * @property {string} name - name of label.
 * @property {string} slug - ID / key of label.
 * @property {string} hex_color - the HEX string of label colour
 */

 /**
  * The store for PathViewer
  * @type {Vuex.Store}
  */
const store = new Vuex.Store({
    modules: {
        lock,
        socket,
    },
    state: {
        //----
        appContext: {
            dataset_id: null,
            image_id: null,
            username: null,
            user_id: null,
        },
        config: {
            base_url: '',
        },
        //----
        osdViewer: null,
        leftColumnWidth: 190,
        rightColumnWidth: 200,
        leftIsCollapsed: false,
        rightIsCollapsed: false,
        /**
         * map of label in the dictionary by label's slug
         * @member {Object.<string, Label>}
         */
        labels: {},
        /**
         * map of whether label is visible or not by label's slug
         * @member {Object.<string, boolean>}
         */
        labelIsVisibleMap: {},
        /**
         * map of label colour and alpha (transparency) by label's slug
         * @member {Object.<string, paper.Color>}
         */
        labelColorMap: {},
        /**
         * map of counts of each annotated region by label by label's slug
         * @member {Object.<string, number>}
         */
        labelCountMap: {},
        /**
         * the label slug of the selected label
         * @member {string}
         */
        selectedLabel: null,
        alertMessage: {
            message: '',
            variant: 'warning',
        },
        helpScreenIndex: 0,
        numberOfHelpScreens: 5,
    },
    getters: {
        // App context
        dataset_id: state => state.appContext.dataset_id,
        image_id: state => state.appContext.image_id,
        user_id: state => state.appContext.user_id,
        username: state => state.appContext.username,
        base_url: state => state.config.base_url,
        socket_url: state => state.config.socket_url,

        // Base URLs
        OMESeadragonBaseURL: (state, getters) => `${getters.base_url}/ome_seadragon`,
        AIMViewerBaseURL: (state, getters) => `${getters.base_url}/aimviewer`,
        
        // App URLs
        getImageDziURL: (state, getters) => `${getters.AIMViewerBaseURL}/deepzoom/get/${getters.image_id}.dzi`,
        getAnnotatorURL: (state, getters) => imageID => `${getters.AIMViewerBaseURL}/datasets/${getters.dataset_id}/images/${imageID}/annotator`,
        getDefaultDictionaryURL: (state, getters) => `${getters.AIMViewerBaseURL}/datasets/${getters.dataset_id}/default_dictionary`,
        // getDictionariesURL: () => null // stub
        getImageNavURL: (state, getters) => `${getters.AIMViewerBaseURL}/datasets/${getters.dataset_id}/image_nav/${getters.image_id}`,
        getRegionAnnotationsURL: (state, getters) => `${getters.AIMViewerBaseURL}/users/${getters.user_id}/annotations/${getters.image_id}/region_annotations`,
        getImageAnnotationURL: (state, getters) => `${getters.AIMViewerBaseURL}/users/${getters.user_id}/annotations/${getters.image_id}/image_annotation`,
        getUserPageURL: (state, getters) => username => `${getters.AIMViewerBaseURL}/users/${username}`,
        
        osdViewer: state => state.osdViewer,
        leftColumnWidth: state => state.leftColumnWidth,
        rightColumnWidth: state => state.rightColumnWidth,
        leftIsCollapsed: state => state.leftIsCollapsed,
        rightIsCollapsed: state => state.rightIsCollapsed,
        labels: state => state.labels,
        labelSlugs: state => Object.keys(state.labels),
        labelIsVisibleMap: state => state.labelIsVisibleMap,
        labelColorMap: state => state.labelColorMap,
        getLabelAlpha: state => labelSlug => state.labelColorMap[labelSlug].alpha,
        getLabelName: state => labelSlug => state.labels[labelSlug].name,
        labelCountMap: state => state.labelCountMap,
        selectedLabel: state => state.selectedLabel,
        alertMessage: state => state.alertMessage,
        helpScreenIndex: state => state.helpScreenIndex,
    },
    mutations: {
        initAppContext(state, payload) {
            state.appContext = payload;
        },
        initConfig(state, payload) {
            state.config = payload;
        },
        setOSDViewer(state, osdViewer) {
            state.osdViewer = osdViewer; 
        },
        setLeftColumnWidth(state, width) {
            state.leftColumnWidth = width;
        },
        setRightColumnWidth(state, width) {
            state.rightColumnWidth = width;
        },
        toggleLeftCollapse(state) {
            state.leftIsCollapsed = !state.leftIsCollapsed;
        },
        toggleRightCollapse(state) {
            state.rightIsCollapsed = !state.rightIsCollapsed;
        },
        goToHelpScreen(state) {
            state.helpScreenIndex = (state.helpScreenIndex + 1) % (state.numberOfHelpScreens + 1);
        },
        /**
         * Mutation sets the annotation labels to use in Pathviewer.
         * Should be used upon setting the dictionary.
         * @param {*} state 
         * @param {Array.<Label>} labels 
         */
        setLabels(state, labels) {
            state.labels = {};
            state.labelIsVisibleMap = {};
            state.labelColorMap = {};
            state.labelCountMap = {};
            labels.forEach((label) => {
                state.labelIsVisibleMap[label.slug] = true;
                state.labelCountMap[label.slug] = 0;
                state.labelColorMap[label.slug] = new paper.Color(label.hex_color);
                state.labelColorMap[label.slug].alpha = 0.5;
                state.labels[label.slug] = label;
            });
        },
        setSelectedLabel(state, labelSlug) {
            state.selectedLabel = labelSlug;
        },
        setLabelVisibility(state, labelIsVisibleMap) {
            state.labelIsVisibleMap = labelIsVisibleMap;
        },
        setLabelColorMap(state, labelColorMap) {
            state.labelColorMap = labelColorMap;
        },
        setRegionCount(state, labelCountMap) {
            state.labelCountMap = labelCountMap;
        },
        setAlert(state, payload) {
            state.alertMessage = payload;
        }
    },
    actions: {
        initAppContext(context, payload) {
            context.commit('initAppContext', payload.appContext);
            if(payload.config)
                context.commit('initConfig', payload.config);
        },
        setOSDViewer(context, osdViewer) {
            context.commit('setOSDViewer', osdViewer);
        },
        /**
         * Set the left column width
         * @param {Object} context 
         * @param {Number} with 
         */
        setLeftColumnWidth(context, width) {
            context.commit('setLeftColumnWidth', width);
        },
        /**
         * Set the right column width
         * @param {Object} context 
         * @param {Number} with 
         */
        setRightColumnWidth(context, width) {
            context.commit('setRightColumnWidth', width);
        },
        toggleLeftCollapse(context) {
            context.commit('toggleLeftCollapse');
        },
        toggleRightCollapse(context) {
            context.commit('toggleRightCollapse');
        },
        setLabels(context, labels) {
            context.commit('setLabels', labels);
        },
        goToHelpScreen(context) {
            context.commit('goToHelpScreen');
        },
        /**
         * @param {Object} context 
         * @param {String} labelSlug 
         */
        setSelectedLabel(context, labelSlug) {
            if(context.state.selectedLabel && context.state.selectedLabel === labelSlug)
                return;
            if(context.state.labels[labelSlug])
                context.commit('setSelectedLabel', labelSlug);
        },
        toggleLabelVisibility(context, labelSlug) {
            if(labelSlug in context.state.labelIsVisibleMap) {
                const labelIsVisibleMap = {...context.state.labelIsVisibleMap};
                labelIsVisibleMap[labelSlug] = !labelIsVisibleMap[labelSlug];
                context.commit('setLabelVisibility', labelIsVisibleMap);
            }
        },
        /**
         * @param {Object} context 
         * @param {{ labelSlug: string, alpha: number }} payload
         */
        setLabelAlpha(context, payload) {
            const labelColorMap = {...context.state.labelColorMap};
            labelColorMap[payload.labelSlug].alpha = payload.alpha;
            context.commit('setLabelColorMap', labelColorMap);
        },
        incrementRegionCount(context, labelSlug) {
            const labelCountMap = {...context.state.labelCountMap};
            labelCountMap[labelSlug] += 1;
            context.commit('setRegionCount', labelCountMap);
        },
        decrementRegionCount(context, labelSlug) {
            const labelCountMap = {...context.state.labelCountMap};
            labelCountMap[labelSlug] -= 1;
            context.commit('setRegionCount', labelCountMap);
        },
        resetRegionCount(context, labelSlug) {
            const labelCountMap = {...context.state.labelCountMap};
            labelCountMap[labelSlug] = 0;
            context.commit('setRegionCount', labelCountMap);
        },
        setRegionCount(context, payload) {
            const labelCountMap = {...context.state.labelCountMap};
            payload.forEach(o => {
                labelCountMap[o.slug] = o.count;
            });
            context.commit('setRegionCount', labelCountMap);
        },
        /**
         * @param {Object} context 
         * @param {{ message: string, variant: string }} payload
         */
        setAlert(context, payload) {
            const alertMessage = {
                message: payload.message, 
                variant: payload.variant ? payload.variant : 'success'
            };
            context.commit('setAlert', alertMessage);
        },
    },
});

export default store;
