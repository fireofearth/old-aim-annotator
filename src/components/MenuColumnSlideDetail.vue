<template>
    <b-form class="flex-to-fill overflow-auto" @submit="$emit('save-image-annotation')" ref="detailform">
        <MenuColumnSlideDetailItem
            v-for="annotation in imageAnnotation"
            :slug="annotation.slug"
            :type="annotation.type"
            :name="annotation.name"
            :removable="annotation.removable"
            :value.sync="annotation.value"
            :key="annotation.slug"
        />
        <b-button type="submit">Save</b-button>
    </b-form>
</template>

<script>
import MenuColumnSlideDetailItem from './MenuColumnSlideDetailItem.vue';
import { mapGetters, mapActions } from 'vuex';
import { debug, showError } from '../utils/utils';

export default {
    name: 'SlideColumnDetail',
    components: {
        MenuColumnSlideDetailItem,
    },
    props: {
        imageAnnotation: {
            type: Array,
            default: [],
        }
    },
    methods: {
        addFormGroup(annotation) {
            const ComponentClass = Vue.extend(MenuColumnSlideDetailItem);
            const instance = new ComponentClass({
                propsData: { annotation },
            });
            instance.$mount();
            this.$refs.detailform.appendChild(instance.$el);
        },
    },
}
</script>