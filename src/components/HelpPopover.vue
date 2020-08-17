<template>
    <b-popover :target="target" triggers="" title="Help" :placement="placement" :show="helpScreenIndex == showAtIndex">
        <template v-slot:title>
            <b-button @click="goToHelpScreen()" class="close" aria-label="Close">
                <span class="d-inline-block" aria-hidden="true">&times;</span>
            </b-button>
            Help
        </template>
        <slot></slot>
    </b-popover>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { debug, showError } from '../utils/utils';

export default {
    name: 'HelpPopover',
    props: {
        placement: {
            type: String,
            default: 'right',
        },
        target: {
            type: String,
            required: true,
        },
        showAtIndex: {
            type: Number,
            required: true,
        },
    },
    computed: {
        ...mapGetters([
            'helpScreenIndex',
        ]),
    },
    methods: {
        ...mapActions([
            'goToHelpScreen',
        ]),
    },
};
</script>
