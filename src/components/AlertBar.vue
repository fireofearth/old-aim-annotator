<template>
    <b-col class="w-100 overflow-auto" id="alertbar" ref="alertbar">
    </b-col>
</template>

<script>
import Vue from 'vue';
import { mapGetters } from 'vuex';
import { debug, showError } from '../utils/utils';

export default {
    name: 'AlertBar',
    computed: {
        ...mapGetters([
            'alertMessage',
        ]),
    },
    watch: {
        /**
         * Note: there is a chance that alertMessage() will be triggered when this component is not yet mounted.
         */
        alertMessage() {
            this.$bvToast.toast(this.alertMessage.message, {
                variant: this.alertMessage.variant,
                solid: true,
                toaster: 'b-toaster-bottom-right',
                autoHideDelay: 2000,
            });
        },
    },
}
</script>

<style>
#alertbar {
    max-height: 100px;
}
</style>