<template>
    <b-list-group flush class="flex-to-fill">
        <b-list-group-item>
            <div id='slide-navigator' :style="{ width: `${leftColumnWidth}px`, height: `${leftColumnWidth}px` }"></div>
        </b-list-group-item>
        <b-list-group-item>
            {{  labelSlugs.reduce((acc, labelSlug) => {
                    return acc + labelCountMap[labelSlug];
                }, 0) }} annotated regions
        </b-list-group-item>
        <b-list-group-item>
            Select annotation label:
        </b-list-group-item>
        <b-list-group-item class="flex-to-fill overflow-auto">
            <b-container fluid>
                <b-row>
                    <b-list-group class="flex-to-fill">
                        <MenuColumnLabelItem 
                            v-for="labelSlug in labelSlugs" 
                            :key="labelSlug" 
                            :id="`label-${labelSlug}`" 
                            :labelSlug="labelSlug"
                        />
                    </b-list-group>
                </b-row>
            </b-container>
        </b-list-group-item>
    </b-list-group>
</template>

<script>
import MenuColumnLabelItem from './MenuColumnLabelItem.vue';
import { mapGetters, mapActions } from 'vuex';
import axios from '../utils/axios';
import path from 'path';
import OpenSeadragon from '../utils/overlay';
import { PathViewerException, debug, showError } from '../utils/utils';

export default {
    name: 'MenuColumnLabelList',
    components: {
        MenuColumnLabelItem,
    },
    computed: {
        ...mapGetters([
            'labels',
            'labelSlugs',
            'labelCountMap',
            'leftColumnWidth',
            'osdViewer'
        ]),
    },
    methods: {
        ...mapActions([
            'setLabels',
            'setAlert',
            'setOSDViewer',
        ]),
        /**
         * Some care needs to be taken to dynamically enable the navigator.
         * Code taken from https://github.com/openseadragon/openseadragon/issues/713
         */
        createNavigator() {
            this.destroyNavigatorIfExists();

            if(this.osdViewer) {
                debug('createNavigator');
                try {
                    this.osdViewer.navigator = new OpenSeadragon.Navigator({
                        id: 'slide-navigator',
                        position:           this.osdViewer.navigatorPosition,
                        sizeRatio:          this.osdViewer.navigatorSizeRatio,
                        maintainSizeRatio:  this.osdViewer.navigatorMaintainSizeRatio,
                        top:                this.osdViewer.navigatorTop,
                        left:               this.osdViewer.navigatorLeft,
                        width:              this.osdViewer.navigatorWidth,
                        height:             this.osdViewer.navigatorHeight,
                        autoResize:         this.osdViewer.navigatorAutoResize,
                        autoFade:           this.osdViewer.navigatorAutoFade,
                        prefixUrl:          this.osdViewer.prefixUrl,
                        viewer:             this.osdViewer,
                        navigatorRotate:    this.osdViewer.navigatorRotate,
                        background:         this.osdViewer.navigatorBackground,
                        opacity:            this.osdViewer.navigatorOpacity,
                        borderColor:        this.osdViewer.navigatorBorderColor,
                        displayRegionColor: this.osdViewer.navigatorDisplayRegionColor,
                    });

                    let count = this.osdViewer.world.getItemCount();
                    let i, tiledImage, bounds;
                    for (i = 0; i < count; i++) {
                        tiledImage = this.osdViewer.world.getItemAt(i);
                        bounds = tiledImage.getBounds();
                        let options = {
                            originalTiledImage: tiledImage,
                            tileSource: tiledImage.source,
                            collectionImmediately: true,
                            opacity: tiledImage.getOpacity()
                        };

                        this.osdViewer.navigator.addTiledImage(options);
                    }
                    this.osdViewer.navigator.update(this.osdViewer.viewport);
                } catch(e) {
                    showError(e);
                }
            }
        },
        destroyNavigatorIfExists() {
            if(this.osdViewer && this.osdViewer.navigator) {
                this.osdViewer.navigator.destroy();
                this.osdViewer.navigator = null;
            }
        },
    },
    mounted() {
        debug('calling mounted');
        this.createNavigator();
    },
    beforeDestroy() {
        debug('calling beforeDestroy');
        this.destroyNavigatorIfExists();
    },
    watch: {
        osdViewer() {
            this.createNavigator();
        },
    },
};
</script>