<template>
    <b-container fluid class="h-100">
        <b-row class="h-100">
            <MenuColumn />
            <ViewerPane />
        </b-row>
    </b-container>
</template>

<script>
import MenuColumn from './MenuColumn.vue';
import ViewerPane from './ViewerPane.vue';

export default {
    name: 'SlideViewer',
    components: {
        MenuColumn,
        ViewerPane,
    },
};
</script>