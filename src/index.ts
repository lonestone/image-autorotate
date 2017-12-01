/**
 * Image orientation
 * Orientation values (from 1 to 8),
 * - see http://www.galloway.me.uk/2012/01/uiimageorientation-exif-orientation-sample-images/
 * - The algo we use do not sees mirrored values, it also swaps left & rights values
 * Error values (-2 & -1),
 * - see https://stackoverflow.com/questions/7584794/accessing-jpeg-exif-rotation-data-in-javascript-on-the-client-side/32490603#32490603
 */
enum OrientationTag {
  NotJpeg = -2,
  Undefined = -1,
  Up = 1,
  UpMirrored = 1,
  Down = 3,
  DownMirrored = 3,
  Left = 8,
  LeftMirrored = 8,
  Right = 6,
  RightMirrored = 6
}

/**
 * Utility to display image preview as base64 string
 * Provides basic implementation to keep .jepg rotation
 * Calculations uses lazy-loading
 */
export default class OrientedImage {
  // original file object (e.g provided by event.target.value coming from <input type="file" />)
  private originalFile: File;

  // original file up-oriented
  private upOrientedfile: Blob;

  // original file as base64 string
  private originalFileUrl = '';

  // original file ip-oriented, as base64 string
  private upFileUrl = '';

  // current orientation of original file
  private orientation = OrientationTag.Undefined;

  constructor(file: File) {
    if (!file) {
      throw new Error('File is not defined or null');
    }

    this.originalFile = file;
  }

  /**
   * Return original file as base 64 url
   * will launch file loading if needed
   * @return {Promise<{ur: string, blob: Blob}>}
   */
  async getOriginalFile() {
    if (this.originalFileUrl === '' ) {
      await this.loadAsDataUrl();
    }

    return { url: this.originalFileUrl, blob: this.originalFile }
  }

  /**
   * Return original file up-oriented as base 64 url
   * will launch file loading & orientation calculation if needed
   * @return {Promise<{ url: string, blob: Blob}>} fileUrl
   */
  async getFile(): Promise<{ url: string, blob: Blob}> {
    const originalFile = await this.getOriginalFile();
    const orientation = await this.getOrientation();

    // if image is already up-oriented, no need for calculation
    if (orientation === OrientationTag.Up) {
      return { url: originalFile.url, blob: this.originalFile };
    }

    // calculate up-oriented image only once
    return this.upFileUrl !== ''
      ? { url: this.upFileUrl, blob: this.upOrientedfile }
      : this.calculateUpOrientedImage(originalFile.url, orientation);
  }

  /**
   * Image loading as Data url
   */
  private async loadAsDataUrl() {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event: any) => {
        this.originalFileUrl = event.target.result;
        resolve(this.originalFileUrl);
      };

      reader.onerror = (error: ErrorEvent) => {
        reject(error);
      };

      reader.readAsDataURL(this.originalFile);
    });
  }

  /**
   * Image loading as array buffer
   * @return {Promise<DataView>}
   */
  private async loadAsArrayBuffer(): Promise<DataView> {
    return new Promise<DataView>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event: any) => {
        const buffer = new DataView(event.target.result);
        resolve(buffer);
      };

      reader.onerror = (error: ErrorEvent) => {
        reject(error);
      };

      reader.readAsArrayBuffer(this.originalFile);
    });
  }

  /**
   * Retrieves orientation tag for original file
   * @return {Promise<OrientationTag>}
   */
  private async getOrientation() {
    if (this.orientation === OrientationTag.Undefined) {
      const buffer = await this.loadAsArrayBuffer();
      this.orientation = await this.calculateOrientationTag(buffer);
    }

    return this.orientation;
  }

  /**
   * Simple algo to detect basic orientation for .jpeg
   * https://stackoverflow.com/questions/7584794/accessing-jpeg-exif-rotation-data-in-javascript-on-the-client-side/32490603#32490603
   * The algo we use do not sees mirrored values, it also swaps left & rights values
   * @param {DataView} buffer
   * @return {Promise<OrientationTag>}
   */
  private async calculateOrientationTag(buffer: DataView): Promise<OrientationTag> {
    if (buffer.getUint16(0, false) !== 0xFFD8) {
      return OrientationTag.NotJpeg;
    }

    const length = buffer.byteLength;
    let offset = 2;
    while (offset < length) {
      const marker = buffer.getUint16(offset, false);
      offset += 2;
      if (marker === 0xFFE1) {
        if (buffer.getUint32(offset += 2, false) !== 0x45786966) {
          return OrientationTag.Undefined;
        }

        const little = buffer.getUint16(offset += 6, false) === 0x4949;
        offset += buffer.getUint32(offset + 4, little);
        const tags = buffer.getUint16(offset, little);
        offset += 2;
        for (let i = 0; i < tags; i++) {
          if (buffer.getUint16(offset + (i * 12), little) === 0x0112) {
            return buffer.getUint16(offset + (i * 12) + 8, little);
          }
        }
      } else if ((marker & 0xFF00) !== 0xFF00) {  // tslint:disable-line
        break;
      } else {
        offset += buffer.getUint16(offset, false);
      }
    }

    return OrientationTag.Undefined;
  }

  /**
   * Provide an up oriented image from
   * @param {string} base64 : the original image in base64 string
   * @param {OrientationTag} orientation : the current orientation
   * @return {Promise<string>}
   */
  private async calculateUpOrientedImage(base64: string, orientation: OrientationTag) {
    return new Promise<{ url: string, blob: Blob }>((resolve, reject) => {
      const img = new Image();

      img.onload = async () => {
        const width = img.width;
        const height = img.height;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // dynamic import for polyfill
        if (!canvas.toBlob) {
          await import('../lib/javascript-canvas-to-blob.min.js')
        }

        // not a valid context for drawing : fallback to original image
        if (!ctx) {
          resolve({ url: base64, blob: this.originalFile });
          return;
        }

        // set proper canvas dimensions before transform & export
        if (4 < orientation && orientation < 9) {
          canvas.width = height;
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        }

        // transform context before drawing image
        switch (orientation) {
          case OrientationTag.Down:
            ctx.transform(-1, 0, 0, -1, width, height);
            break;

          case OrientationTag.Right:
            ctx.transform(0, 1, -1, 0, height, 0);
            break;

          case OrientationTag.Left:
            ctx.transform(0, -1, 1, 0, 0, width);
            break;

          default:
            break;
        }

        // draw image
        ctx.drawImage(img, 0, 0);

        // export base64
        const upBase64 = canvas.toDataURL('image/jpeg');
        this.upFileUrl = upBase64;

        // export as blob & resolve
        canvas.toBlob((result: Blob) => {
          this.upOrientedfile = result;
          resolve({ url: upBase64, blob: result });
        });
      };

      img.onerror = (error) => reject(error);

      img.src = base64;
    });
  }
}
