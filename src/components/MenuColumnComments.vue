<template>
    <b-list-group flush class="flex-to-fill overflow-auto">
        <MenuColumnCommentItem
            v-for="comment in comments"
            :key="comment.comment_id"
            :username="comment.username"
            :message="comment.message"
        />
    </b-list-group>
</template>

<script>
import MenuColumnCommentItem from './MenuColumnCommentItem.vue';
import { mapGetters, mapActions } from 'vuex';
import { debug, showError } from '../utils/utils';

export default {
    name: 'MenuColumnComments',
    components: {
        MenuColumnCommentItem,
    },
    computed: {
        ...mapGetters('socket', [
            'comments',
        ]),
    },
}
</script>