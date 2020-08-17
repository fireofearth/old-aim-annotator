/**
 * 
 * Uses code from https://github.com/eriksjolund/OpenSeadragonPaperjsOverlay
 */
import OpenSeadragon from 'openseadragon';
import paper from 'paper';
import { debug, showError } from './utils';

/**
 * 
 * @param {OpenSeadragon.Viewer} viewer 
 * @param {Vue} target 
 */
const Overlay = function(viewer, target) {
    const self = this;

    this._viewer = viewer;

    this._containerWidth = 0;
    this._containerHeight = 0;
    this._lastZoom = 0;
    this._vue = target;

    this._canvasdiv = document.createElement( 'div');
    this._canvasdiv.style.position = 'absolute';
    this._canvasdiv.style.left = 0;
    this._canvasdiv.style.top = 0;
    this._canvasdiv.style.width = '100%';
    this._canvasdiv.style.height = '100%';
    this._viewer.canvas.appendChild(this._canvasdiv);

    this._canvas = document.createElement('canvas');
    this._canvas.setAttribute('id', 'osd-overlaycanvas');
    this._canvasdiv.appendChild(this._canvas);

    paper.setup(this._canvas);

    this._viewer.addHandler('open-failed', function() {
        self._vue.setAlert({ message: 'Error: failed to load image from databse', variant: 'danger' });
    });
    
    this._viewer.addHandler('animation', function() {
        const vpCenter  = self._viewer.viewport.getCenter(true);
        const zoom      = self._viewer.viewport.getZoom(true);
        const imgCenter = self._viewer.viewport.viewportToImageCoordinates(vpCenter.x, vpCenter.y);
        const query     = { x: imgCenter.x, y: imgCenter.y, z: zoom };
        self._vue.$router.push({ name: self._vue.$route.name, query })
        self._vue.$capture.catch('move');
        self.resizecanvas();
    });

    this._viewer.addHandler('animation-start', function() {
        self._vue.$capture.catch('move-start');
    });

    this._viewer.addHandler('animation-finish', function() {
        self._vue.$capture.catch('move-finish');
    });

    this._viewer.addHandler('open', function() {
        if(self._vue.$route.query.hasOwnProperty('x')) {
            self._viewer.viewport.zoomTo(Number(self._vue.$route.query.z), null, true);
            const vpCoords = self._viewer.viewport.imageToViewportCoordinates(
                    Number(self._vue.$route.query.x), Number(self._vue.$route.query.y));
            self._viewer.viewport.panTo(vpCoords, true);
        }
        self.resizecanvas();
    });
};

// ----------
Overlay.prototype = {
    // ----------
    paperCanvas: function() {
        return this._canvas;
    },
    resizecanvas: function() {
        if (this._containerWidth !== this._viewer.container.clientWidth) {
            this._containerWidth   = this._viewer.container.clientWidth;
        }
        if (this._containerHeight !== this._viewer.container.clientHeight) {
            this._containerHeight   = this._viewer.container.clientHeight;
        }
        this._canvasdiv.setAttribute('width', this._containerWidth);
        this._canvas.setAttribute('width', this._containerWidth);
        this._canvasdiv.setAttribute('height', this._containerHeight);
        this._canvas.setAttribute('height', this._containerHeight);
        paper.view.viewSize = new paper.Size(this._containerWidth, this._containerHeight);

        var viewportZoom = this._viewer.viewport.getZoom(true);
        var image1       = this._viewer.world.getItemAt(0);
        paper.view.zoom  = image1.viewportToImageZoom(viewportZoom);
        if(this._lastZoom !== paper.view.zoom) {
            paper.project.layers.forEach(layer => {
                layer.strokeWidth = this._vue.getUpdatedStokeWidth();
            });
            this._lastZoom = paper.view.zoom;
        }

        var center = this._viewer.viewport.viewportToImageCoordinates(
                this._viewer.viewport.getCenter(true));
        paper.view.center = new paper.Point(center.x, center.y);
        paper.view.update();
    }
};

OpenSeadragon.Viewer.prototype.paperjsOverlay = function(target) {
    if (this._paperjsOverlayInfo) {
        return this._paperjsOverlayInfo;
    }

    this._paperjsOverlayInfo = new Overlay(this, target);
    return this._paperjsOverlayInfo;
};

export default OpenSeadragon;
