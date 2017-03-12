;(function (root) {
    if (typeof root.Lazy !== 'undefined') return // :(

    var Lazy
    var lastKnownScrollPosition = 0
    var ticking = false
    var LAZY_CONSTS = Object.freeze({
        className: 'lazy',
        scroll: 'scroll',
        load: 'load',
        error: 'error',
    })

    /**
     * Returns true if the given element is in the viewport
     * 
     * @param  {Element} element
     * @return {Boolean}
     */
    var elementInViewport = function elementInViewport(element) {
        var rect = element.getBoundingClientRect()
        var vWidth = window.innerWidth || doc.documentElement.clientWidth
        var vHeight = window.innerHeight || doc.documentElement.clientHeight

        // Return false if it's not in the viewport
        if (rect.right < 0 || rect.bottom < 0 || rect.left > vWidth || rect.top > vHeight)
            return false

        // Return true if any of its four corners are visible
        return element.contains(document.elementFromPoint(rect.left, rect.top)) ||
            element.contains(document.elementFromPoint(rect.right, rect.top)) ||
            element.contains(document.elementFromPoint(rect.right, rect.bottom)) ||
            element.contains(document.elementFromPoint(rect.left, rect.bottom))
    }

    /**
     * Lazy loads a specific image element
     * 
     * @param  {Element} imageElement
     */
    var loadImage = function loadImage(imageElement) {
        if (imageElement.getAttribute('data-src') === '') {
            throw 'Image element does not have a data-src attribute'
        }

        return new Promise(function loadImagePromise(resolve, reject) {
            var src = imageElement.getAttribute('data-src')

            imageElement.src = src

            imageElement.addEventListener('load', function loadImageSuccessHandler(event) {
                imageElement.removeEventListener(LAZY_CONSTS.load, loadImageSuccessHandler, false)
                resolve(imageElement)
            })

            imageElement.addEventListener('error', function loadImageErrorHandler(event) {
                imageElement.removeEventListener(LAZY_CONSTS.error, loadImageErrorHandler, false)
                reject(imageElement)
            })
        })
    }

    /**
     * Returns an array of elements with a specified className
     * 
     * @param  {String}     className   Defaults to 'lazy'
     * @return {Element[]}
     */
    var getImagesToLazyLoad = function getImagesToLazyLoad(className) {
        if (typeof className === 'undefined') {
            className = LAZY_CONSTS.className
        }

        var imageElementCollection = document.getElementsByClassName(className)
        var images = []
        var len = imageElementCollection.length
        var image
        var i

        for (i = 0; i < len; i++) {
            image = imageElementCollection[i]
            images = images.concat(image)
        }

        return images
    }

    /**
     * Creates a callback to pass to a scroll listener
     * 
     * @param  {Element[]}  images
     * @param  {Function}   callback
     * @return {Function}
     */
    var createHandleScroll = function createHandleScroll(images, callback) {
        var numberOfImagesToLoad = images.length

        return function handleScroll(event) {
            lastKnownScrollPosition = window.scrollY;

            // Throttle the scroll listener
            if (!ticking) {
                root.requestAnimationFrame(function() {
                    if (numberOfImagesToLoad <= 0)
                        event.target.removeEventListener(LAZY_CONSTS.scroll, handleScroll)

                    images.forEach(function (image) {
                        if (image.src) return

                        if (elementInViewport(image.parentElement)) {
                            if (typeof callback !== 'function') {
                                loadImage(image)
                            } else {
                                callback(image)
                            }

                            numberOfImagesToLoad--  // FIXME: Should do this asynchronously
                                                    //        on the image 'load' event
                        }
                    })

                    ticking = false
                })
            }

            ticking = true;
        }
    }

    Lazy = Object.freeze({
        loadImage: loadImage,
        getImagesToLazyLoad: getImagesToLazyLoad,
        createHandleScroll: createHandleScroll
    })

    root.Lazy = Lazy
})(this)
