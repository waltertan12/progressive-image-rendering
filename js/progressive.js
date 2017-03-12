;(function (root) {
    'use strict'
    
    if (typeof root.Lazy === 'undefined') {
        throw 'Requires the Lazy library'
    }

    if (typeof root.StackBlur === 'undefined') {
        throw 'Requires the StackBlur library'
    }
    
    var PROGRESSIVE_CONSTS = Object.freeze({
        load: 'load',
        scroll: 'scroll',

        // See progressive.css
        progressiveFull: 'progressiveFull',
        progressiveCanvas: 'progressiveCanvas',
        opacityOne: 'opacityOne',
        opacityZero: 'opacityZero'
    })

    var imageToLazyLoad = root.Lazy.getImagesToLazyLoad()
    var handleScroll = root.Lazy.createHandleScroll(imageToLazyLoad, function (image) {
        root.Lazy.loadImage(image)
            .then(function (imageThumb) {
                var canvas = imageThumb.nextElementSibling
                var fragment
                var imageFull

                root.StackBlur.blur(imageThumb, canvas, 3, true)

                // Create new image element to insert
                imageFull = document.createElement('img')
                imageFull.src = imageThumb.getAttribute('data-full')
                imageFull.className = [
                        PROGRESSIVE_CONSTS.progressiveFull, 
                        PROGRESSIVE_CONSTS.opacityZero
                    ].join(' ')
                fragment = document.createDocumentFragment()
                fragment.appendChild(imageFull)

                // Hide canvas and show full size image when fully loaded
                imageFull.addEventListener(PROGRESSIVE_CONSTS.load, function loadFullSuccessListener() {
                    imageFull.removeEventListener(PROGRESSIVE_CONSTS.load, loadFullSuccessListener)

                    imageFull.className = [
                        PROGRESSIVE_CONSTS.progressiveFull, 
                        PROGRESSIVE_CONSTS.opacityOne
                    ].join(' ')
                    canvas.className = [
                        PROGRESSIVE_CONSTS.progressiveCanvas, 
                        PROGRESSIVE_CONSTS.opacityZero
                    ].join(' ')
                })

                canvas.parentElement.appendChild(fragment)
            })
            .catch(function (data) {
                console.warn(data)
            })
    })

    document.addEventListener(PROGRESSIVE_CONSTS.scroll, handleScroll)
})(this)