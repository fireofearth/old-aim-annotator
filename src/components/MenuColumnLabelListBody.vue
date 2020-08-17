<template>
    <b-card-body class="flex-to-content-with-basis">
        Current dictionary: {{ currDictionary }}
    </b-card-body>
</template>

<script>

export default {
    name: 'MenuColumnLabelListBody',
    props: {
        currDictionary: {
            type: String,
            default: 'no dictionary',
        },
    },
};
</script>