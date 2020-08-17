import Vue from 'vue';
import VueRouter from 'vue-router';
import SlideViewerContainer from '../components/SlideViewerContainer.vue';
import MenuColumnLabelList from '../components/MenuColumnLabelList.vue';
import MenuColumnSlideList from '../components/MenuColumnSlideList.vue';
import MenuColumnSlideDetail from '../components/MenuColumnSlideDetail.vue';
import MenuColumnLabelListBody from '../components/MenuColumnLabelListBody.vue';
import MenuColumnSlideListBody from '../components/MenuColumnSlideListBody.vue';
import MenuColumnSlideDetailBody from '../components/MenuColumnSlideDetailBody.vue';
import MenuColumnComments from '../components/MenuColumnComments.vue';
import MenuColumnCommentBody from '../components/MenuColumnCommentBody.vue';

Vue.use(VueRouter);

const router = new VueRouter({
    routes: [
        {
            path: '/',
            component: SlideViewerContainer,
            children: [
                {
                    name: 'label-list',
                    path: '',
                    components: {
                        'menu-column': MenuColumnLabelList,
                        'menu-column-body': MenuColumnLabelListBody,
                    },
                },
                {
                    name: 'slide-list',
                    path: 'slides',
                    components: {
                        'menu-column': MenuColumnSlideList,
                        'menu-column-body': MenuColumnSlideListBody,
                    },
                },
                {
                    name: 'slide-details',
                    path: 'details',
                    components: {
                        'menu-column': MenuColumnSlideDetail,
                        'menu-column-body': MenuColumnSlideDetailBody,
                    },
                },
                {
                    name: 'slide-comments',
                    path: 'comments',
                    components: {
                        'menu-column': MenuColumnComments,
                        'menu-column-body': MenuColumnCommentBody,
                    }
                }
            ],
        },
    ],
});

export default router;