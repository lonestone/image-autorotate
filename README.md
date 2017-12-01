# image-autorotate
Upload your pictures in js while keeping orientation. 
In-browser library.
Use lazy calculation, so it's all asynchronous

## Use case
In your HTML : 
```html
<input type="file" onClick="upload()">
```

```javascript
  import OrientedImage from 'image-autorotate';

  async upload(event) {
    const file = event.target.value;

    const reader = new OrientedImage(file);

    /**
    * Use getFile() to retrieve the image with orientation
    * - url is the base64 image
    * - blob is the blob corresponding to the file
    */
    const { url, blob } = await reader.getFile()
      
      /**
      * If an error occurs, you can fallback to the original (i.e non rotated with exif) file instead
      */
      .catch(() => reader.getOriginalFile());
    
  }
```

## Tested with
- Chrome 62
- Firefox 57
- IE 11
- Edge 16
