<template>
    <b-collapse :visible="!leftIsCollapsed" :style="{ width: `${leftColumnWidth}px` }" md="auto" id="menu-bar">
        <b-col cols="12" md="auto" class="h-100">
            <b-row class="h-100">
                <b-card no-body title="Menu" class="flex-to-fill">
                    <b-card-header header-tag="nav">
                        Menu
                        <!-- <b-nav card-header tabs>
                            <b-nav-item :to="{ name: 'label-list', query: $route.query }" exact exact-active-class="active">
                                Main
                            </b-nav-item>
                            <b-nav-item :to="{ name: 'slide-list', query: $route.query }" exact exact-active-class="active">
                                Slides
                            </b-nav-item>
                            <b-nav-item :to="{ name: 'slide-details', query: $route.query }" exact exact-active-class="active">
                                Details
                            </b-nav-item>
                            <b-nav-item :to="{ name: 'slide-comments', query: $route.query }" exact exact-active-class="active">
                                Comments
                            </b-nav-item>
                        </b-nav> -->
                    </b-card-header>
                    <RouterView
                        name="menu-column"
                        :wsiFiles="wsiFiles"
                        :currWsiFile="currWsiFile"
                        :imageAnnotation="imageAnnotation"
                        @save-image-annotation="saveImageAnnotation"
                    />
                    <RouterView
                        name="menu-column-body"
                        :currDictionary="currDictionary"
                        :currWsiFile="currWsiFile"
                        :nextWsiFile="nextWsiFile"
                        :prevWsiFile="prevWsiFile"
                    />
                </b-card>
            </b-row>
        </b-col>
        <HelpPopover target="menu-bar" placement="right" :showAtIndex="3">
            Main:
            <br />
            Select the label you want to create region annotations with. 
            The regions will share the same colour as your label. 
            Each label keeps a tally of the # of regions.
            <br /><br />
            <b-button variant="light" class="label-isvisible-btn demo-btn"></b-button> Toggles visibility of regions for this label. You cannot draw using labels that are invisible.
            <br />
            <b-button variant="light" class="label-config-btn demo-btn"></b-button> Toggles extra settings for labels like the transparency of regions.
        </HelpPopover>
        <HelpPopover target="menu-bar" placement="right" :showAtIndex="4">
            Slides:
            <br />
            Select a WSI image in the dataset to open in the annotator.
            <br />
            <br />
            <b-button class="user-btn">Prev</b-button>: go to the previous WSI image.
            <br />
            <b-button class="user-btn">Next</b-button>: go to the next WSI image.
        </HelpPopover>
        <HelpPopover target="menu-bar" placement="right" :showAtIndex="5">
            Slide details:
            <br />
            Make notes about this WSI image and view image metadata (coming soon).
        </HelpPopover>
    </b-collapse>
</template>

<script>
import HelpPopover from './HelpPopover.vue';
import { mapGetters, mapActions } from 'vuex';
import axios from '../utils/axios';
import path from 'path';
import { PathViewerException, debug, showError } from '../utils/utils';

export default {
    name: 'MenuColumn',
    components: {
        HelpPopover,
    },
	data() {
		return {
            dictionaries: [],
            currDictionary: null,
            wsiFiles: [],
            currWsiFile: null,
            nextWsiFile: null,
            prevWsiFile: null,
            imageAnnotation: [],
        };
    },
    computed: {
        ...mapGetters([
            'image_id',
            'base_url',
            'leftIsCollapsed',
            'labels',
            'labelSlugs',
            'labelCountMap',
            'leftColumnWidth',
            'helpScreenIndex'
        ]),
    },
    methods: {
        ...mapActions([
            'setLabels',
            'setAlert',
            'goToHelpScreen',
        ]),
        async loadImages() {
            debug('loading slide list');
            try {
                const res = await axios.get(this.$store.getters.getImageNavURL);
                if(res.status == 200) {
                    this.wsiFiles = res.data.wsi_files;
                    this.currWsiFile = res.data.curr_wsi_file;
                    this.nextWsiFile = res.data.next_wsi_file;
                    this.prevWsiFile = res.data.prev_wsi_file;
                } else {
                    this.setAlert({ message: `Error ${res.status}: failed to load the slides for this dataset`, variant: 'danger' });
                    return;
                }
            } catch(e) {
                this.setAlert({ message: 'Unknown error: failed to load the slides for this dataset', variant: 'danger' });
                showError(e)
                return;
            }
        },
        async loadImageAnnotation() {
            try {
                debug(this.$store.getters.getImageAnnotationURL);
                const res = await axios.get(this.$store.getters.getImageAnnotationURL);
                this.imageAnnotation = res.data;
                if(res.status == 200) {
                    // do nothing
                } else {
                    this.setAlert({ message: `Error ${res.status}: failed to load image annotation`, variant: 'danger' });
                }
            } catch(e) {
                this.setAlert({ message: 'Unknown error: failed to load image annotation', variant: 'danger' });
                showError(e)
            }
        },
        async saveImageAnnotation() {
            debug('sending ' + JSON.stringify(this.imageAnnotation));
            try {
                const res = await axios.post(
                    this.$store.getters.getImageAnnotationURL, 
                    { image_annotation: this.imageAnnotation },
                );
          
                if(res.status == 200) {
                    // do nothing
                } else {
                    this.setAlert({ message: `Error ${res.status}: failed to save image annotation`, variant: 'danger' });
                }
            } catch(e) {
                this.setAlert({ message: 'Unknown error: failed to save image annotation', variant: 'danger' });
                showError(e);
            }
        },
        /**
         * Note: not currently being used since OME Seadragon doesn't yet return WSI image data
         * @async
         */
        async loadImageMetadata() {
            try {
                const res = await axios.get(`${this.base_url}/api/images/${this.image_id}/metadata`);
                const data = res.data;
                debug(JSON.stringify(data))
            } catch(e) {
                showError(e);
            }
        },
        async getDefaultDictionary() {
            try {
                const res = await axios.get(this.$store.getters.getDefaultDictionaryURL);
                if(res.status == 200) {
                    const dictionary = res.data;
                    this.currDictionary = dictionary.name;
                    this.setLabels(dictionary.labels);
                    debug('loaded default dictionary');
                } else {
                    this.setAlert({ message: `Error ${res.status}: failed to load annotations from databse`, variant: 'danger' });
                    return;
                }
            } catch(e) {
                this.setAlert({ message: 'Unknown error: failed to load annotations to database', variant: 'danger' });
                showError(e)
            }
        },
        /**
         * Lock is released in ViewerPane.watch.labelSlugs
         * TODO: make locking less hacky by moving all the async logic to Vuex store
         */
        handleRetrieveData() {
            if(this.$store.getters['lock/isUnlocked']) {
                this.$store.dispatch('lock/acquire');
                debug('retrieving data');
                (async () => {
                    await Promise.all([
                        this.loadImages(),
                        this.loadImageAnnotation(),
                        // this.loadImageMetadata(),
                        this.getDefaultDictionary()
                    ]);
                })();
                return true;
            } else {
                return false;
            }
        },
    },
    watch: {
        helpScreenIndex(index) {
            switch(index) {
                case 0:
                case 3:
                    this.$router.push({ name: 'label-list', query: this.$route.query });
                    break;
                case 4:
                    this.$router.push({ name: 'slide-list', query: this.$route.query });
                    break;
                case 5:
                    this.$router.push({ name: 'slide-details', query: this.$route.query });
                    break;
            }
        },
    },
	created() {
        if(!this.handleRetrieveData())
            throw new PathViewerException('failed to aquire lock to retrieve data at component creation');
	},
};
</script>

<style>
#menu-bar {
    -webkit-transition: none;
    transition: none;
    padding: 0;
}

.nav-link {
    padding: 0px 5px !important;
}
</style>
