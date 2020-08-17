<template>
    <b-col>
        <b-row id="toolbar" class="justify-content-md-center">
            <b-col class="flex-to-content">
                <b-row>
                    <b-button id="left-collapse-btn" class="text-hide" :style="{ 'background-image': (leftIsCollapsed ? 'url(\'/static/fontawesome-free-5.11.2-web/svgs/solid/angle-right.svg\')' : 'url(\'/static/fontawesome-free-5.11.2-web/svgs/solid/angle-left.svg\')') }" @click="$emit('toggle-left-collapse')">
                        LC
                    </b-button>
                </b-row>
            </b-col>
            <b-col class="flex-to-content">
                <b-row>
                    <b-button-group id="nav-tools-btn-group">
                        <b-button id="zoom-in-btn-tgt" class="zoom-in-btn text-hide" @click="$emit('zoom-in')">
                            Zoom In
                        </b-button>
                        <b-tooltip target="zoom-in-btn-tgt" triggers="hover" placement="bottom" :delay="{show: 400, hide: 0}">
                            Zoom In (+)
                        </b-tooltip>
                        <b-button id="zoom-out-btn-tgt" class="zoom-out-btn text-hide" @click="$emit('zoom-out')">
                            Zoom Out
                        </b-button>
                        <b-tooltip target="zoom-out-btn-tgt" triggers="hover" placement="bottom" :delay="{show: 400, hide: 0}">
                            Zoom Out (-)
                        </b-tooltip>
                        <b-button id="home-btn-tgt" class="home-btn text-hide">
                            Home
                        </b-button>
                        <b-tooltip target="home-btn-tgt" triggers="hover" placement="bottom" :delay="{show: 400, hide: 0}">
                            Reset image zoom
                        </b-tooltip>
                    </b-button-group>
                </b-row>
            </b-col>
            <b-col class="flex-to-content">
                <b-row>
                    <b-button-group id="mouse-tools-btn-group">
                        <b-button id="draw-toggle-btn-tgt" class="draw-toggle-btn text-hide" @click="$emit('set-tool', 'draw')" :class="{ active : currTool === 'draw' }">
                            Draw
                        </b-button>
                        <b-tooltip target="draw-toggle-btn-tgt" triggers="hover" placement="bottom" :delay="{show: 400, hide: 0}">
                            Annotate regions (Q)
                        </b-tooltip>
                        <b-button id="drag-toggle-btn-tgt" class="drag-toggle-btn text-hide" @click="$emit('set-tool', 'drag')" :class="{ active: currTool === 'drag' }">
                            Drag
                        </b-button>
                        <b-tooltip target="drag-toggle-btn-tgt" triggers="hover" placement="bottom" :delay="{show: 400, hide: 0}">
                            Select and drag regions (E)
                        </b-tooltip>
                        <b-button id="del-toggle-btn-tgt" class="del-toggle-btn text-hide" @click="$emit('delete-selected-paths')">
                            Del
                        </b-button>
                        <b-tooltip target="del-toggle-btn-tgt" triggers="hover" placement="bottom" :delay="{show: 400, hide: 0}">
                            Delete selected regions
                        </b-tooltip>
                    </b-button-group>
                </b-row>
            </b-col>
            <b-col class="flex-to-content">
                <b-row>
                    <b-button variant="primary" class="user-btn" @click="goToHelpScreen()">
                        Help
                    </b-button>
                </b-row>
            </b-col>
            <b-col v-if="showAdvancedBar" class="flex-to-content">
                <b-row>
                    <b-button variant="primary" class="user-btn" @click="toggleAdvancedBar()">
                        Advanced
                    </b-button>
                </b-row>
            </b-col>
            <b-col v-else class="flex-to-fill">
                <b-row :style="{ 'justify-content': 'flex-start' }">
                    <b-button variant="primary" class="user-btn" @click="toggleAdvancedBar()">
                        Advanced
                    </b-button>
                </b-row>
            </b-col>
            <b-col class="flex-to-fill">
                <b-collapse :visible="showAdvancedBar" id="advanced-bar">
                    <b-row :style="{ 'justify-content': 'flex-start' }">
                        <b-col class="flex-to-content">
                            <b-row>
                                <b-button variant="primary" class="user-btn fill-green" @click="$emit('save-paths')">
                                    Save
                                </b-button>
                            </b-row>
                        </b-col>
                        <b-col class="flex-to-content">
                            <b-row>
                                <b-button variant="primary" class="user-btn fill-cyan" @click="$emit('deselect-all')">
                                    Deselect_All
                                </b-button>
                            </b-row>
                        </b-col>
                        <b-col class="flex-to-content">
                            <b-row>
                                <b-button variant="primary" class="user-btn fill-pink" @click="$emit('select-label')">
                                    Select_Label
                                </b-button>
                            </b-row>
                        </b-col>
                        <!-- <b-col class="flex-to-content">
                            <b-row>
                                <b-button variant="warning" class="user-btn" @click="$emit('clear-label')">
                                    Clear_Label
                                </b-button>
                            </b-row>
                        </b-col> -->
                        <!-- <b-col class="flex-to-content">
                            <b-row>
                                <b-button variant="danger" class="user-btn" @click="$emit('clear-all')">
                                    Clear_All
                                </b-button>
                            </b-row>
                        </b-col> -->
                    </b-row>
                </b-collapse>
            </b-col>
        </b-row>
        <HelpPopover target="nav-tools-btn-group" placement="bottomright" :showAtIndex="1">
            Navigation buttons:
            <br />
            <b-button variant="light" class="zoom-in-btn demo-btn"></b-button> To zoom in.
            <br />
            <b-button variant="light" class="zoom-out-btn demo-btn"></b-button> To zoom out.
            <br />
            <b-button variant="light" class="home-btn demo-btn"></b-button> To zoom back.
            <br />
            <br />
            You can also minimize sidebars using the
            <b-button variant="light" class="demo-btn" style="background-image: url('/static/fontawesome-free-5.11.2-web/svgs/solid/angle-left.svg');"></b-button>
            and <b-button variant="light" class="demo-btn" style="background-image: url('/static/fontawesome-free-5.11.2-web/svgs/solid/angle-right.svg');"></b-button>
            buttons.
            <br />
            <br />
            Click close or the <strong>Help</strong> button to go to the next popup!
        </HelpPopover>
        <HelpPopover target="mouse-tools-btn-group" placement="bottom" :showAtIndex="2">
            Annotating buttons:
            <br />
            <b-button variant="light" class="draw-toggle-btn demo-btn"></b-button> Toggle to draw a single region annotation with your mouse. Your annotation will be labelled by the label you select in the menu.
            <br />
            <b-button variant="light" class="drag-toggle-btn demo-btn"></b-button> Toggle to select/unselect multiple region annotations. Drag selected region annotations to move them around the screen.
            <br />
            <b-button variant="light" class="del-toggle-btn demo-btn"></b-button> Delete the annotated regions you selected.
            <br />
            When no tool is toggled, drag to move around the screen and use your scroll button to zoom in/out.
        </HelpPopover>
        <HelpPopover target="toolbar" placement="bottomleft" :showAtIndex="1">
            Hotkeys:
            <br />
            Q - toggle draw a region annotation
            <br />
            E - toggle select/unselect
            <br />
            W,A,S,D - pan around the navigator
            <br />
            1,2,-,+ - zoom in/out
            <br />
            Ctrl+S - save all annotations
        </HelpPopover>
        <HelpPopover target="toolbar" placement="bottomright" :showAtIndex="2">
            More options:
            <br /><br />
            <b-button class="user-btn">Help</b-button>: simple help popups.
            <br /><br />
            <b-button class="user-btn">Advanced</b-button>: toggle advanced user options.
            <br /><br />
            <b-button class="user-btn">Deselect_All</b-button>: unselect all regions you selected.
            <br /><br />
            <b-button class="user-btn">Save</b-button>: save all the annotated regions. I will auto-save your work every 3 minutes when you are not drawing!
            <br /><br />
            <b-button class="user-btn">Clear_Label</b-button>: delete all annotated regions corresponding to the label you selected in the menu.
            <br /><br />
            <b-button class="user-btn">Clear_All</b-button>: delete all annotated regions.
        </HelpPopover>
    </b-col>
</template>

<script>
import HelpPopover from './HelpPopover.vue';
import { mapGetters, mapActions } from 'vuex';
import { debug, union, isArray, isNonemptyArray, intersection, difference, showError } from '../utils/utils';

export default {
    name: 'ToolBar',
    components: {
        HelpPopover,
    },
    data() {
        return {
            showAdvancedBar: false,
        };
    },
    props: {
        currTool: String,
    },
    computed: {
        ...mapGetters([
            'helpScreenIndex',
            'leftIsCollapsed',
            'rightIsCollapsed',
        ]),
    },
    methods: {
        ...mapActions([
            'goToHelpScreen',
        ]),
        toggleAdvancedBar() {
            this.showAdvancedBar = !this.showAdvancedBar;
        },
    },
    watch: {
        helpScreenIndex(n) {
            if(n == 2) this.showAdvancedBar = true;
        }
    }
};
</script>

<style>
#toolbar {
    padding-top: 2px;
    padding-bottom: 2px;
    background-color: var(--light);
}

#advanced-bar {
    -webkit-transition: none;
    transition: none;
    padding: 0;
}

.user-btn {
    padding: 0 5px !important; 
}

.user-btn a, .user-btn a:hover {
    color: inherit;
    text-decoration: inherit;
}

.fill-green {
    background-color: var(--green) !important;
    border-color: var(--green) !important;
}

.fill-cyan {
    background-color: var(--cyan) !important;
    border-color: var(--cyan) !important;
}

.fill-pink {
    background-color: var(--pink) !important;
    border-color: var(--pink) !important;
}

#toolbar .flex-to-content {
    margin-right: 1rem;
}

#toolbar .btn {
    height: 25px;
}

#toolbar .btn-group .btn {
    background-color: var(--teal);
    width: 35px;
}

#left-collapse-btn {
    background-color: var(--cyan);
    width: 35px;
}

#right-collapse-btn {
    background-color: var(--cyan);
    width: 35px;
}

.zoom-in-btn {
    background-image: url('/static/fontawesome-free-5.11.2-web/svgs/solid/search-plus.svg');
}

.zoom-out-btn {
    background-image: url('/static/fontawesome-free-5.11.2-web/svgs/solid/search-minus.svg');
}

.home-btn {
    background-image: url('/static/fontawesome-free-5.11.2-web/svgs/solid/home.svg');
}

#nav-toggle-btn {
    background-image: url('/static/fontawesome-free-5.11.2-web/svgs/solid/walking.svg');
}

.draw-toggle-btn {
    background-image: url('/static/fontawesome-free-5.11.2-web/svgs/solid/pen.svg');
}

.drag-toggle-btn {
    background-image: url('/static/fontawesome-free-5.11.2-web/svgs/solid/hand-point-up.svg');
}

.del-toggle-btn {
    background-image: url('/static/fontawesome-free-5.11.2-web/svgs/solid/trash-alt.svg');
}
</style>
