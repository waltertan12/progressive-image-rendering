/* globals Promise */
;(function (root) {
    'use strict'

    if (typeof root.Lazy !== 'undefined') return // :(

    /**
     * @type {Object}
     */
    var LAZY_CONSTS = Object.freeze({
        className: 'lazy',
        complete: 'complete',
        scroll: 'scroll',
        load: 'load',
        error: 'error',
        fullSrc: 'data-src'
    })

    /**
     * Used to throttle scroll event
     * 
     * @see  createHandleScroll
     * @type {Boolean}
     */
    var ticking = false

    /**
     * Returns true if the given element is in the viewport
     * 
     * @param  {Element} element
     * @return {Boolean}
     */
    var elementInViewport = function elementInViewport(element) {
        var rect = element.getBoundingClientRect()
        var vWidth = window.innerWidth || root.documentElement.clientWidth
        var vHeight = window.innerHeight || root.documentElement.clientHeight

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
     * @return {Promise}
     */
    var loadImage = function loadImage(imageElement) {
        if (imageElement.getAttribute('data-src') === '') {
            throw 'Image element does not have a data-src attribute'
        }

        return new Promise(function loadImagePromise(resolve, reject) {
            var src = imageElement.getAttribute(LAZY_CONSTS.fullSrc)

            imageElement.src = src

            imageElement.addEventListener(LAZY_CONSTS.load, function loadImageSuccessHandler() {
                imageElement.removeEventListener(LAZY_CONSTS.load, loadImageSuccessHandler, false)
                resolve(imageElement)
            })

            imageElement.addEventListener(LAZY_CONSTS.error, function loadImageErrorHandler() {
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
        if (typeof className !== 'string') {
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

    var validateOption = function validateOption(original, option) {
        if (typeof option === string && option !== '') 
            return option

        return original 
    }

    /**
     * Creates a callback to pass to a scroll listener
     * 
     * @param  {Element[]}  images
     * @param  {Function}   callback
     * @return {Function}
     */
    var createHandleScroll = function createHandleScroll(images, callback, options) {
        var numberOfImagesToLoad = images.length

        if (typeof options === 'object') {
            LAZY_CONSTS.className = validateOption(LAZY_CONSTS.className, options.className)
            LAZY_CONSTS.complete = validateOption(LAZY_CONSTS.complete, options.complete)
            LAZY_CONSTS.fullSrc = validateOption(LAZY_CONSTS.fullSrc, options.fullSrc)
        }

        return function handleScroll(event) {
            // Throttle the scroll listener
            if (!ticking) {
                root.requestAnimationFrame(function() {
                    if (numberOfImagesToLoad <= 0)
                        event.target.removeEventListener(LAZY_CONSTS.scroll, handleScroll)

                    images.forEach(function (image) {
                        if (image.className.indexOf(LAZY_CONSTS.complete) >= 0) return

                        if (elementInViewport(image.parentElement)) {
                            image.className += LAZY_CONSTS.complete

                            if (typeof callback !== 'function') {
                                loadImage(image)
                            } else {
                                callback(image)
                            }

                            numberOfImagesToLoad--  // FIXME: Should probably do this asynchronously
                                                    //        on the image 'load' event
                        }
                    })

                    ticking = false
                })
            }

            ticking = true
        }
    }

    root.Lazy = Object.freeze({
        loadImage: loadImage,
        getImagesToLazyLoad: getImagesToLazyLoad,
        createHandleScroll: createHandleScroll
    })
    
})(this)
