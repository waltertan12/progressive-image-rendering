# Progressive Image Rendering
This repository holds an implentation of Medium's progressive image rendering

[Demo](https://waltertan12.github.io/progressive-image-rendering/)

## Steps
1. Load a small version of the full image
2. Once the small image is loaded
    - Display/blur the small image on Canvas
    - Start fetching the full size image
3. Once the full size is loaded
    - Insert the full size image to the DOM
    - Reduce the visibility of the Canvas to 0

## Example HTML Markup
```html
<div class="progressiveContainer">
    <div class="progressivePlaceholder" style="max-width: 960px; max-height: 600px;">
        <div class="aspectRatio_16_10">
            <img class="progressiveThumb lazy" data-src="/path/to/thumbnail" data-full="/path/to/fullsize" />
            <canvas class="progressiveCanvas opacityOne"></canvas>
            <noscript>
                <img src="/path/to/fullsize" class="progressiveFull opacityOne" />
            </noscript>
        </div>
    </div>
</div>
```
