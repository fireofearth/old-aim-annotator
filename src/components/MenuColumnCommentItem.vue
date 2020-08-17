<template>
    <b-list-group-item class="comment-group-item">
        <a :href="userPageURL">{{ username }}</a>: {{ message }}
    </b-list-group-item>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { PathViewerException, debug, showError } from '../utils/utils';

export default {
    name: 'MenuColumnCommentItem',
    props: {
        username: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
    },
    computed: {
        ...mapGetters([
            'getUserPageURL',
        ]),
        userPageURL() {
            return this.getUserPageURL(this.username)
        },
    },
}
</script>