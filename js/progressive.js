// /** globals StackBlur, document */
;(function () {
    var imageThumbs = document.getElementsByClassName('progressiveThumb')
    var len = imageThumbs.length
    var imageThumb
    var i

    for (i = 0; i < len; i++) {
        imageThumb = imageThumbs[i]

        imageThumb.addEventListener('load', function loadListener() {
            var canvas = imageThumb.nextElementSibling
            var context = canvas.getContext('2d')
            var imageFull

            // Draw image on Canvas and blur
            StackBlur.blur(imageThumb, canvas, 5, false)

            imageFull = document.createElement('img')
            imageFull.src = imageThumb.getAttribute('data-full')
            imageFull.className = 'progressiveFull opacityZero'
            fragment = document.createDocumentFragment()
            fragment.appendChild(imageFull)
            imageFull.addEventListener('load', function () {
                imageFull.className = 'progressiveFull opacityOne'
                canvas.className = 'progressiveCanvas opacityZero'
            })

            canvas.parentElement.appendChild(fragment)
        })
    }
})()