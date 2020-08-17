<template>
    <b-col class="d-flex flex-column h-100">
        <b-row>
            <ToolBar 
                :currTool="currTracker ? currTracker.tool : null"
                @zoom-in="handleZoomIn"
                @zoom-out="handleZoomOut"
                @set-tool="setTool"
                @delete-selected-paths="deleteSelectedPaths"
                @save-paths="handleSavePaths"
                @deselect-all="deselectAllPaths"
                @select-label="selectAllPathsInLabel"
                @toggle-left-collapse="toggleLeftCollapse"
                @toggle-right-collapse="toggleRightCollapse"
            />
        </b-row>
        <b-row class="flex-to-fill">
            <div id="osd"></div>
        </b-row>
        <b-row>
            <AlertBar />
        </b-row>
    </b-col>
</template>

<script>
import ToolBar from './ToolBar.vue';
import AlertBar from './AlertBar.vue';
import OpenSeadragon from '../utils/overlay';
import axios from '../utils/axios';
import qs from 'qs';
import paper from 'paper';
import { mapGetters, mapActions } from 'vuex';
import uuid4 from 'uuid4';
import tools from '../utils/tools';
import { PathViewerException, debug, getCookie, union, isArray, isNonemptyArray, intersection, difference, showError } from '../utils/utils';

const setLayerColor = (layer, color) => {
    layer.children.forEach(child => { child.fillColor = color; });
};

const SECOND = 1000;
const MINUTE = SECOND * 60;

export default {
    name: 'ViewerPane',
    components: {
        ToolBar,
        AlertBar,
    },
    data() {
        return {
            autosaveProcessID: null,
            autosaveDelay: MINUTE * 5,
            path: null,
            hitItem: null,
            /**
             * A dictionary of Paper.js layers for each label
             * @member {Object.<string, paper.Layer>} labelLayers
             */
            labelLayers: {},
            viewer: null,
            trackers: {
                draw: null,
                sel: null,
                drag: null,
                test: null,
            },
            currTracker: null,
            cache: {
                test: {
                    paperPt: null,
                    osdPt: null,
                },
            },
        };
    },
    computed: {
        ...mapGetters([
            'dataset_id',
            'image_id',
            'username',
            'base_url',
            'labelSlugs',
            'labelIsVisibleMap',
            'labelColorMap',
            'selectedLabel',
            'getLabelName',
            'leftIsCollapsed',
            'rightIsCollapsed',
            'leftColumnWidth',
            'rightColumnWidth',
        ]),
    },
    methods: {
        ...mapActions([
            'setSelectedLabel',
            'incrementRegionCount',
            'decrementRegionCount',
            'resetRegionCount',
            'setRegionCount',
            'setAlert',
        ]),
        /*****************************/
        /** Action Keys and Buttons **/
        /*****************************/
        handlePanUp() {
            if(this.$store.getters['lock/isUnlocked'])
                this.viewer.viewport.panBy(
                        this.viewer.viewport.deltaPointsFromPixels(new OpenSeadragon.Point(0, -40)));
        },
        handlePanDown() {
            if(this.$store.getters['lock/isUnlocked'])
                this.viewer.viewport.panBy(
                        this.viewer.viewport.deltaPointsFromPixels(new OpenSeadragon.Point(0, 40)));
        },
        handlePanLeft() {
            if(this.$store.getters['lock/isUnlocked'])
                this.viewer.viewport.panBy(
                        this.viewer.viewport.deltaPointsFromPixels(new OpenSeadragon.Point(-40, 0)));
        },
        handlePanRight() {
            if(this.$store.getters['lock/isUnlocked'])
                this.viewer.viewport.panBy(
                        this.viewer.viewport.deltaPointsFromPixels(new OpenSeadragon.Point(40, 0)));
        },
        keyPressHandler(event) {
            event.preventDefault();
            switch(event.key) {
                case 'q':
                    this.setTool('draw');
                    break;
                case 'e':
                    this.setTool('drag');
                    break;
                case 'w':
                case 'ArrowUp':
                    this.handlePanUp();
                    break;
                case 'a':
                case 'ArrowLeft':
                    this.handlePanLeft();
                    break;
                case 's':
                    if(event.ctrlKey) {
                        this.handleSavePaths();
                        break;
                    }
                case 'ArrowDown':
                    this.handlePanDown();
                    break;
                case 'd':
                case 'ArrowRight':
                    this.handlePanRight();
                    break;
                case '1':
                case '-':
                case '_':
                    this.handleZoomOut();
                    break;
                case '2':
                case '+':
                case '=':
                    this.handleZoomIn();
                    break;
            }
        },
        canvasScrollHandler(event) {
            event.preventDefault();
            if(event.deltaY > 0) {
                this.handleZoomOut(1.05);
            } else if(event.deltaY < 0) {
                this.handleZoomIn(1.05);
            }
        },
        handleZoomIn(zoom=null) {
            if(!zoom) {
                zoom = 2;
            }
            if(this.$store.getters['lock/isUnlocked'])
                if(this.viewer.viewport.getZoom() <= 400) {
                    if(this.viewer.viewport.getZoom() * zoom <= 400)
                        this.viewer.viewport.zoomBy(zoom);
                    else
                        this.viewer.viewport.zoomBy(400 / this.viewer.viewport.getZoom());
                }
        },
        handleZoomOut(zoom=null) {
            if(!zoom) {
                zoom = 2;
            }
            if(this.$store.getters['lock/isUnlocked'])
                if(this.viewer.viewport.getZoom() >= 1) {
                    if(this.viewer.viewport.getZoom() * (1 / zoom) >= 1)
                        this.viewer.viewport.zoomBy(1 / zoom);
                    else
                        this.viewer.viewport.zoomBy(1 / this.viewer.viewport.getZoom());
                }
        },
        toggleLeftCollapse() {
            this.$store.dispatch('toggleLeftCollapse');
            const center = this.viewer.viewport.pixelFromPoint(this.viewer.viewport.getCenter());
            let newCenter = null;
            if(this.leftIsCollapsed) {
                newCenter = new OpenSeadragon.Point(center.x - (this.leftColumnWidth / 2), center.y);
            } else {
                newCenter = new OpenSeadragon.Point(center.x + (this.leftColumnWidth / 2), center.y);
            }
            this.viewer.viewport.panTo(this.viewer.viewport.pointFromPixel(newCenter), true);
        },
        toggleRightCollapse() {
            this.$store.dispatch('toggleRightCollapse');
            const center = this.viewer.viewport.pixelFromPoint(this.viewer.viewport.getCenter());
            let newCenter = null;
            if(this.rightIsCollapsed) {
                newCenter = new OpenSeadragon.Point(center.x + (this.rightColumnWidth / 2), center.y);
            } else {
                newCenter = new OpenSeadragon.Point(center.x - (this.rightColumnWidth / 2), center.y);
            }
            this.viewer.viewport.panTo(this.viewer.viewport.pointFromPixel(newCenter), true);
        },
        /******************************/
        /** Toorbar Advanced buttons **/
        /******************************/
        deleteSelectedPaths() {
            paper.project.selectedItems.forEach(item => {
                if(item instanceof paper.Path) {
                    item.selected = false;
                    this.decrementRegionCount(item.layer.data.labelSlug);
                    item.remove();
                }
            });
        },
        deselectAllPaths() {
            this.labelSlugs.forEach(labelSlug => {
                this.labelLayers[labelSlug].selected = false;
            });
            paper.view.draw();
        },
        selectAllPathsInLabel() {
            this.labelLayers[this.selectedLabel].children.forEach(item => {
                if(item instanceof paper.Path)
                    item.selected = true;
            });
        },
        handleSavePaths() {
            if(this.$store.getters['lock/isUnlocked']) {
                debug('now saving paths');
                this.$store.dispatch('lock/acquire');
                (async () => {
                    await this.savePaths();
                    this.$store.dispatch('lock/release');
                    debug('paths saved');
                })();
                return true;
            } else {
                debug('failed to acquire lock to save path');
                return false;
            }
        },
        handleClearLabel() {
            if(this.selectedLabel) {
                this.clearPaths(this.selectedLabel);
                this.setAlert({ 
                    message: `Cleared annotations for ${this.getLabelName(this.selectedLabel)}. Remember to save to keep these changes`, 
                    variant: 'warning' 
                });
            }
        },
        handleClearAll() {
            this.labelSlugs.forEach(this.clearPaths);
            this.setAlert({ 
                message: `Cleared all annotations. Remember to save to keep these changes`, 
                variant: 'warning' 
            });
        },
        /**************************/
        /** Implementation level **/
        /**************************/
        /**
         * Exports all label layers if called with no parameters. Otherwise exports only layers corr. to list of labels.
         * @returns {Promise} a promise for the HTTP request for annotation regions
         */
        savePaths(labelSlugs = null) {
            if(!labelSlugs)
                labelSlugs = this.labelSlugs;
            else if(!labelSlugs.length)
                return;
            
            const payload = {};
            labelSlugs.forEach(labelSlug => {
                payload[labelSlug] = this.labelLayers[labelSlug].children.length ? this.labelLayers[labelSlug].exportJSON() : null;
            });
            return this.sendSavePathMetadata(payload);
        },
        async sendSavePathMetadata(payload) {
            try {
                const res = await axios.post(this.$store.getters.getRegionAnnotationsURL, payload);
                
                if(res.status == 200) {
                    this.setAlert({ message: 'Annotations are saved' });
                } else {
                    this.setAlert({ message: `Error ${res.status}: failed to saved annotations to database`, variant: 'danger' })
                }
                return true;
            } catch(e) {
                this.setAlert({ message: 'Unknown error: failed to saved annotations to databse', variant: 'danger' });
                showError(e);
                return false;
            }
        },
        /**
         * Loads annotation regions to Paper.js for specified layer slugs.
         * When loading annotation regions, previously selected paths are deselected.
         * This is to prevent a bug where layers are in paper.project.selectedItems when loading
         * @async
         * @param {string[]} slugsToLoad - label slugs to load annotation regions from
         * @returns {Promise}
         */
        async loadLayers(slugsToLoad) {
            let res = null;
            try {
                res = await axios.get(this.$store.getters.getRegionAnnotationsURL, {
                    params: { labels: slugsToLoad },
                    paramsSerializer(params) {
                        return qs.stringify(params, {arrayFormat: 'repeat'});
                    },
                });
                if(res.status == 200) {
                    // do nothing
                } else {
                    this.setAlert({ message: `Error ${res.status}: failed to load annotations from database`, variant: 'danger' });
                }
            } catch(e) {
                this.setAlert({ message: 'Unknown error: failed to load annotations to database', variant: 'danger' });
                showError(e);
            }

            const payload = this.labelSlugs.map(labelSlug => {
                if(res && res.data && res.data[labelSlug]) {
                    this.labelLayers[labelSlug].importJSON(res.data[labelSlug]);
                    this.labelLayers[labelSlug].strokeWidth = this.getUpdatedStokeWidth();
                    // fixes bug where layers are selected if children are selected
                    this.labelLayers[labelSlug].selected = false;
                }
                return {
                    slug: labelSlug, 
                    count: this.labelLayers[labelSlug].children.length
                };
            });
            this.setRegionCount(payload);
        },
        setActiveLayer() {
            if(this.selectedLabel)
                this.labelLayers[this.selectedLabel].activate();
        },
        updateLayerVisibility() {
            this.labelSlugs.forEach(labelSlug => {
                this.labelLayers[labelSlug].visible = this.labelIsVisibleMap[labelSlug];
            });
            paper.view.draw();
        },
        updatePathColors() {
            this.labelSlugs.forEach(labelSlug => {
                setLayerColor(this.labelLayers[labelSlug], this.labelColorMap[labelSlug]);
            });
            paper.view.draw();
        },
        getUpdatedStokeWidth() {
            return 2 / paper.view.zoom;
        },
        setupAutosave() {
            this.autosaveProcessID = window.setInterval(
                    this.handleSavePaths, this.autosaveDelay);
            debug(`autosave setInterval() id is ${this.autosaveProcessID}`);
        },
        clearPaths(labelSlug) {
            try {
                this.labelLayers[labelSlug].removeChildren();
                this.resetRegionCount(labelSlug);
            } catch(e) {
                showError(e);
            }
        },
        ...tools,
    },
    watch: {
        /**
         * called after switching / loading the dictionary to set up layers corresponding to that dicionary's labels. 
         * If label is not removed when switching dictionary then corresponding layer remains on the project, otherwise layer is saved, then removed
         * When new layers are set up, make request to load layers with previously saved regions
         * Lock is acquired in MenuBar.handleGetDefaultDictionary()
         * TODO: move logic to Vuex action
         * TODO: test change dictionary works
         * TODO: can I enforce watch order?
         */
        labelSlugs(n, c) {
            debug('labelSlugs changed');
            const currLabelSlugs = new Set(c);
            const nextLabelSlugs = new Set(n);
            const newLabelLayers = {};
            intersection(currLabelSlugs, nextLabelSlugs).forEach(labelSlug => {
                newLabelLayers[labelSlug] = this.labelLayers[labelSlug];
            });
            const slugsToLoadSet = difference(nextLabelSlugs, currLabelSlugs);
            slugsToLoadSet.forEach(labelSlug => {
                newLabelLayers[labelSlug] = new paper.Layer();
                newLabelLayers[labelSlug].data.labelSlug = labelSlug;
                paper.project.addLayer(newLabelLayers[labelSlug]);
            });
            const slugsToSaveSet = difference(currLabelSlugs, nextLabelSlugs);
            slugsToSaveSet.forEach(labelSlug => {
                this.labelLayers[labelSlug].remove();
            });
            this.labelLayers = newLabelLayers;
            if(nextLabelSlugs.size) {
                this.setSelectedLabel(nextLabelSlugs.keys().next().value);
            }
            (async () => {
                await Promise.all([
                    this.savePaths([...slugsToSaveSet]), 
                    this.loadLayers([...slugsToLoadSet])
                ]);
                this.$store.dispatch('lock/release');
            })();
        },
        labelIsVisibleMap() {
            debug('labelIsVisibleMap changed');
            this.updateLayerVisibility();
        },
        labelColorMap() {
            debug('labelColorMap changed');
            this.updatePathColors();
        },
        selectedLabel() {
            debug('selectedLabel changed');
            this.setActiveLayer();
        },
    },
    created() {
        paper.install(window);

    },
    /**
     * TODO: mount triggers slide-navigator to duplicate. Stop that from happening?
     */
    mounted() {
        this.viewer = OpenSeadragon({
            id: 'osd',
            tileSources: this.$store.getters.getImageDziURL,
            zoomInButton: 'zoom-in-btn-tgt',
            zoomOutButton: 'zoom-out-btn-tgt',
            homeButton: 'home-btn-tgt',
            preserveImageSizeOnResize: true,
            animationTime: 0.8,
            zoomPerClick: 1.0,
            constrainDuringPan: true,
            navigatorHeight: 100,
            navigatorWidth: 180,
            // loadTilesWithAjax: true,
            ajaxWithCredentials: true,
        });
        window.osdviewer= this.viewer;
        this.viewer.paperjsOverlay(this);
        // document.osd = this.viewer;
        // MenuColumn needs a reference to viewer
        this.$store.dispatch('setOSDViewer', this.viewer);

        /**
         * disable default trackers and use custom handlers.
         * Hotkeys will only enable when the mouse is on the canvas or
         * when focus is on the canvas.
         * https://github.com/openseadragon/openseadragon/issues/1405
         * https://openseadragon.github.io/examples/ui-keyboard-navigation/
         */
        this.viewer.innerTracker.keyHandler = null;
        this.viewer.innerTracker.scrollHandler = null;
        const canvasDiv = document.getElementById('osd')
            .querySelector('.openseadragon-canvas');
        canvasDiv.addEventListener('keydown', this.keyPressHandler, false);
        canvasDiv.addEventListener('wheel', this.canvasScrollHandler, false);
        canvasDiv.addEventListener('mouseenter', () => { 
            canvasDiv.focus(); });
        canvasDiv.addEventListener('focus', () => { 
            this.$capture.catch('enter'); });
        canvasDiv.addEventListener('blur', () => {
            this.$capture.catch('leave'); });

        this.trackers.draw = new OpenSeadragon.MouseTracker({
            element: this.viewer.canvas,
            pressHandler: this.drawPressHandler,
            dragHandler: this.drawDragHandler,
            releaseHandler: this.drawReleaseHandler,
        });
        this.trackers.draw.tool = 'draw';
        this.trackers.draw.setTracking(false);

        this.trackers.drag = new OpenSeadragon.MouseTracker({
            element: this.viewer.canvas,
            clickTimeThreshold: 300,
            clickHandler: this.dragClickHandler,
            pressHandler: this.dragPressHandler,
            dragHandler: this.dragDragHandler,
            releaseHandler: this.dragReleaseHandler,
        });
        this.trackers.drag.tool = 'drag';
        this.trackers.drag.setTracking(false);

        this.setupAutosave();
    },
};
</script>
