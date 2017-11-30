# image-autorotate
An in-browser zero-dependencies image rotation library.
Upload your image in javascript / typescript and keep it's original orientation if it's a .jpeg
Use lazy calculation, so it's all asynchronous

## use-case
In your HTML : 
```
<input type="file" onClick="upload()">
```

```
  async upload(event) {
    const file = event.target.value;

    const reader = new ImgOriented(file);

    /**
    * Use getFile to retrieve the image with orientation
    * - url is the base64 image
    * - blob is the blob corresponding to the file
    */
    const { url, blob } = await reader.getFile()
      
      /**
      * If an error occurs, you can provide the original file instead
      */
      .catch(async () => {
        const url = await reader.getOriginalFileUrl()
        return { url, blob: file }
      });
    
  }
```

## Todo
check browsers compatibility
