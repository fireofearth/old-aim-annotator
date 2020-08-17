import paper from 'paper';
import { debug, showError, PathViewerException } from './utils';

export default {
    /**
     * Toggle tool.
     * @param {string|null} tool - one of 'draw', or 'drag'
     */
    setTool(tool) {
        if(this.$store.getters['lock/isUnlocked']) {
            debug(`switching to tool ${tool}`);
            if(this.currTracker) {
                this.currTracker.setTracking(false);
            }
            if(!tool || (this.currTracker && 
                    this.currTracker.tool === tool)) {
                this.currTracker = null;
            } else {
                this.currTracker = this.trackers[tool];
                this.currTracker.setTracking(true);
            }
            if(this.currTracker)
                this.viewer.setMouseNavEnabled(false);
            else
                this.viewer.setMouseNavEnabled(true);
        }
    },
    dragClickHandler(event) {
        debug('dragClickHandler');
        if(event.quick) {
            const transformed_point = paper.view.viewToProject(
                    new paper.Point(event.position.x, event.position.y));
            const hitTestResult = paper.project.hitTest(transformed_point, 
                    { fill: true, stroke: true, segments: true, 
                            tolerance: paper.settings.hitTolerance, class: paper.Path });
            if(hitTestResult) {
                hitTestResult.item.selected = !hitTestResult.item.selected;
            }
        }
    },
    dragPressHandler(event) {
        debug('dragPressHandler');
        if(this.hitItem) {
            this.hitItem = null;
        }
        const transformed_point = paper.view.viewToProject(new paper.Point(event.position.x, event.position.y));
        const hitTestResult = paper.project.hitTest(transformed_point, 
            { fill: true, stroke: true, segments: true, 
                    tolerance: paper.settings.hitTolerance, class: paper.Path });
        if(hitTestResult && this.$store.getters['lock/isLocked']) {
            debug('hit item but failed to acquire lock to drag');
        }
        if(hitTestResult && hitTestResult.item.selected && this.$store.getters['lock/isUnlocked']) {
            this.$store.dispatch('lock/acquire');
            this.hitItem = hitTestResult.item;
        }
    },
    dragDragHandler(event) {
        debug('dragDragHandler');
        if (this.hitItem !== null) {
            const transformed_point1 = paper.view.viewToProject(new paper.Point(0,0));
            const transformed_point2 = paper.view.viewToProject(new paper.Point(event.delta.x, event.delta.y));
            paper.project.selectedItems.forEach(item => {
                if(item instanceof paper.Path) {
                    item.position = item.position.add(transformed_point2.subtract(transformed_point1));
                }
            });
            paper.view.draw();
        }
    },
    dragReleaseHandler(event) {
        debug('dragReleaseHandler');
        if(this.hitItem !== null) {
            this.hitItem = null;
            this.$store.dispatch('lock/release');
        }
    },
    /**
     * 
     * @param {Object} event 
     */
    drawPressHandler(event) {
        debug('drawPressHandler');
        if(this.path) {
            this.path.selected = false;
            this.path = null;
        }
        if(this.$store.getters['lock/isLocked']) {
            debug('failed to acquire lock to draw');
        }
        if(this.selectedLabel && this.labelIsVisibleMap[this.selectedLabel] && 
                this.$store.getters['lock/isUnlocked']) {
            this.$store.dispatch('lock/acquire');
            const transformed_point = paper.view.viewToProject(
                    new paper.Point(event.position.x, event.position.y));
            this.path = new paper.Path({
                segments: [transformed_point]
            });
            this.path.strokeWidth   = this.getUpdatedStokeWidth();
            this.path.strokeScaling = true;
            this.path.strokeColor   = 'black';
            this.path.fillColor     = this.labelColorMap[this.selectedLabel];
            this.path.visible       = true;
            this.incrementRegionCount(this.selectedLabel);
        }
    },
    drawDragHandler(event) {
        debug('drawDragHandler');
        if(this.path) {
            const transformed_point = paper.view.viewToProject(new paper.Point(event.position.x, event.position.y));
            this.path.add(transformed_point);
        }
    },
    /**
     * The path is removed if it is too small or if it is a line
     * @param {Object} event 
     */
    drawReleaseHandler(event) {
        debug('drawReleaseHandler');
        if(this.path) {
            if(this.path.segments.length < 3 || this.path.length < 60) {
                debug('drawn path is too small! Removing.');
                this.path.remove();
                this.decrementRegionCount(this.selectedLabel);
            } else {
                this.path.closed = true;
                this.path.simplify(5);
                this.path.flatten(1);
            }
            this.path.selected = false;
            this.path = null;
            this.$store.dispatch('lock/release');
        }
        this.setTool(null);
    },
    testPressHandler(event) {
        console.log(`osd: ${event.position.x} ${event.position.y}`);
        this.cache.test.osdPt = event.position;
        const point = paper.view.viewToProject(new paper.Point(event.position.x, event.position.y));
        console.log(`paper: ${point.x} ${point.y}`);
        this.cache.test.paperPt = point;
    },
    testDragHandler(event) {
        console.log(`osd dev: ${event.position.x - this.cache.test.osdPt.x} ${event.position.y - this.cache.test.osdPt.y}`);
        this.cache.test.osdPt = event.position;
        const point = paper.view.viewToProject(new paper.Point(event.position.x, event.position.y));
        console.log(`paper dev: ${point.x - this.cache.test.paperPt.x} ${point.y - this.cache.test.paperPt.y}`);
    
        console.log(`paper len: ${Math.sqrt(Math.pow(point.x - this.cache.test.paperPt.x, 2) + Math.pow(point.y - this.cache.test.paperPt.y, 2))}`);
        this.cache.test.paperPt = point;
    },
    testEndDragHandler(event) {
        this.cache.test.osdPt = null;
        this.cache.test.paperPt = null;
    },
};