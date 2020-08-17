
<template>
    <b-card-body class="flex-to-content-with-basis">
        Current slide: {{ currWsiFile ? currWsiFile.name : 'no slide' }}
    </b-card-body>
</template>

<script>
export default {
    name: 'MenuColumnSlideDetailBody',
    props: ['currWsiFile'],
}
</script>