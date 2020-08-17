// openwith.js


// This example 'enabledHandler' code is not needed since we configure
// {'supported_objects': ['image']} to only enable the viewer when a
// single image is selected.
// However, it can be used if you need more flexibility to set enable/disable
// status of your Open with option.
// OME.setOpenWithEnabledHandler("Image viewer", function(selected) {
//     // selected is a list of {'id':1, 'name': 'test.tiff', 'type': 'image'}
//     // Only enabled for single objects...
//     if (selected.length !== 1) return false;
//     // Only enable for images
//     return (selected[0].type !== 'image') return false;
// });


// We have already configured the base url to be 'webindex' /webclient/ so
// we just need to add 'img_detail/' and the selected image ID
OME.setOpenWithUrlProvider("AIM annotator", function(selected, url) {
    // url = aimviewer
    url = `${location.origin}/${url}`;
    const part = `/images/${selected[0].id}/annotator`;

    // We try to traverse the jstree, to find parent of selected image
    if ($ && $.jstree) {
        try {
            const inst = $.jstree.reference('#dataTree');
            const parent = OME.getTreeImageContainerBestGuess(selected[0].id);
            if (parent && parent.data && parent.type === 'dataset') {
                url += `/datasets/${parent.data.id}` + part;
            } else {
                url += part;
            }
        } catch(err) {
            console.log(err);
        }
    }
    return url;
});