<template>
    <b-card-body class="flex-to-content-with-basis">
        <b-form @submit="makeComment()">
            <b-form-textarea
                rows="2"
                v-model="message"
                no-resize
            />
            <b-button type="submit">Save</b-button>
        </b-form>
    </b-card-body>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { PathViewerException, debug, showError } from '../utils/utils';

export default {
    name: 'MenuColumnCommentBody',
    data() {
        return {
            message: '',
        };
    },
    methods: {
        ...mapActions('socket', [
            'pushComment',
        ]),
        makeComment() {
            this.pushComment(this.message);
            this.message = '';
        },
    },
}
</script>