<template>
    <b-list-group-item class="label-list-group-item">
        <b-col>
            <b-row class="flex-to-fill">
                <b-button-group :style="{'background-color': labelColorMap[labelSlug].toCSS('hex') }" class="label-button-group flex-to-fill">
                    <b-button :class="['label-sel-btn', { active : selectedLabel == labelSlug }]" @click="setSelectedLabel(labelSlug)">
                        <p>{{ labelCountMap[labelSlug] }} {{ labels[labelSlug].name }}</p>
                    </b-button>
                    <b-button :class="['label-tertiary-btn', 'label-isvisible-btn', 'text-hide', { active : labelIsVisibleMap[labelSlug] }]" @click="toggleLabelVisibility(labelSlug)">V</b-button>
                    <b-button :class="['label-tertiary-btn', 'label-config-btn', 'text-hide', { active : showConfig }]" @click="toggleConfig()">C</b-button>
                </b-button-group>
            </b-row>
            <b-collapse :visible="showConfig">
                <b-row class="flex-to-fill">
                    <b-container fluid>
                        <label :for="`config-label-${labelSlug}-alpha`">Transparency: {{ labelAlpha }}</label>
                        <b-form-input :id="`config-label-${labelSlug}-alpha`" v-model="labelAlpha" type="range" min="0.01" max="1" step="0.02" @change="setLabelAlpha({labelSlug, alpha: labelAlpha})"></b-form-input>
                    </b-container>
                </b-row>
            </b-collapse>
        </b-col>
    </b-list-group-item>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import axios from '../utils/axios';
import path from 'path';
import { debug, showError } from '../utils/utils';

export default {
    name: 'MenuColumnLabelItem',
	data() {
		return {
            showConfig: false,
            labelAlpha: this.$store.getters.getLabelAlpha(this.labelSlug),
        };
    },
    props: {
        labelSlug: {
            type: String,
            required: true,
        }
    },
    computed: {
        ...mapGetters([
            'labels',
            'labelIsVisibleMap',
            'labelColorMap',
            'labelCountMap',
            'selectedLabel',
        ]),
    },
    methods: {
        ...mapActions([
            'toggleLabelVisibility',
            'setSelectedLabel',
            'setLabelAlpha',
        ]),
        toggleConfig() {
            this.showConfig = !this.showConfig;
        },
    },
};
</script>

<style>
.label-list-group-item {
    display: flex !important;
}

.label-button-group {
    display: flex;
    justify-content: flex-end;
}

.label-sel-btn {
    text-align: left !important;
    padding-left: 5px !important;
}

.label-tertiary-btn {
    flex: 0 0 25px !important;
}

.label-isvisible-btn {
    background-image: url('/static/fontawesome-free-5.11.2-web/svgs/solid/eye.svg');
    background-repeat: no-repeat;
    background-position: center center;
}

.label-config-btn {
    background-image: url('/static/fontawesome-free-5.11.2-web/svgs/solid/cog.svg');
    background-repeat: no-repeat;
    background-position: center center;
}
</style>
