<template>
    <b-form-group :id="`input-group-${slug}`" class="slide-detail-form-group" :label="name" :label-for="`input-${slug}`">
        <template v-slot:label>
            <b-button v-if="removable" @click="null" class="close" aria-label="Close">
                <span class="d-inline-block" aria-hidden="true">&times;</span>
            </b-button>
            {{ name }}
        </template>
        <b-form-textarea
            v-if="type === 'textarea'"
            :id="`input-${slug}`"
            rows="10"
            v-model="mutableValue"
        >
        </b-form-textarea>
        <b-form-input
            v-else
            :id="`input-${slug}`"
            v-model="mutableValue"
        >
        </b-form-input>
    </b-form-group>
</template>

<script>
import { debug, showError } from '../utils/utils';

export default {
    name: 'SlideColumnDetailItem',
    props: ['name', 'slug', 'type', 'removable', 'value'],
    data() {
        return { mutableValue: this.value };
    },
    watch: {
        mutableValue(newValue) {
            this.$emit('update:value', newValue);
        }
    }
}
</script>
