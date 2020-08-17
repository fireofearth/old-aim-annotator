<template>
    <b-card-body class="flex-to-content-with-basis">
        <b-container fluid>
            <b-row align-h="between">
                <b-col cols="1" md="auto">
                    <b-row>
                        <b-button :disabled="prevWsiFile ? false : true" :href="prevWsiFile ? getAnnotatorURL(prevWsiFile.id) : '#'">
                            Prev
                        </b-button>
                    </b-row>
                </b-col>
                <b-col cols="12" md="auto">
                    <b-row>
                        <b-button :disabled="nextWsiFile ? false : true" :href="nextWsiFile ? getAnnotatorURL(nextWsiFile.id) : '#'">
                            Next
                        </b-button>
                    </b-row>
                </b-col>
            </b-row>
        </b-container>
    </b-card-body>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { PathViewerException, debug, showError } from '../utils/utils';

export default {
    name: 'MenuColumnSlideListBody',
    props: ['currWsiFile', 'nextWsiFile', 'prevWsiFile'],
    computed: {
        ...mapGetters([
            'getAnnotatorURL',
            'rightColumnWidth',
            'rightIsCollapsed',
            'helpScreenIndex',
        ]),
    },
    methods: {
        ...mapActions([
            'setAlert',
            'goToHelpScreen',
        ]),
    },
};
</script>

<style scoped>
.btn {
    padding: 5px 10px;
}
</style>