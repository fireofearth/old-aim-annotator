<template>
    <b-list-group flush class="flex-to-fill overflow-auto">
        <b-list-group-item
            v-for="wsiFile in wsiFiles"
            :active="(currWsiFile && wsiFile.id == currWsiFile.id) ? true : false"
            :key="wsiFile.id"
            :href="getAnnotatorURL(wsiFile.id)"
        >
            {{ wsiFile.name }}
        </b-list-group-item>
    </b-list-group>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { debug, showError } from '../utils/utils';

export default {
    name: 'SlideColumnList',
    props: {
        wsiFiles: {
            type: Array,
            required: true,
        },
        currWsiFile: {
            required: false,
        },
    },
    computed: {
        ...mapGetters([
            'getAnnotatorURL',
        ]),
    },
}
</script>