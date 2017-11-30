"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Image orientation
 * Orientation values (from 1 to 8),
 * - see http://www.galloway.me.uk/2012/01/uiimageorientation-exif-orientation-sample-images/
 * - The algo we use do not sees mirrored values, it also swaps left & rights values
 * Error values (-2 & -1),
 * - see https://stackoverflow.com/questions/7584794/accessing-jpeg-exif-rotation-data-in-javascript-on-the-client-side/32490603#32490603
 */
var OrientationTag;
(function (OrientationTag) {
    OrientationTag[OrientationTag["NotJpeg"] = -2] = "NotJpeg";
    OrientationTag[OrientationTag["Undefined"] = -1] = "Undefined";
    OrientationTag[OrientationTag["Up"] = 1] = "Up";
    OrientationTag[OrientationTag["UpMirrored"] = 1] = "UpMirrored";
    OrientationTag[OrientationTag["Down"] = 3] = "Down";
    OrientationTag[OrientationTag["DownMirrored"] = 3] = "DownMirrored";
    OrientationTag[OrientationTag["Left"] = 8] = "Left";
    OrientationTag[OrientationTag["LeftMirrored"] = 8] = "LeftMirrored";
    OrientationTag[OrientationTag["Right"] = 6] = "Right";
    OrientationTag[OrientationTag["RightMirrored"] = 6] = "RightMirrored";
})(OrientationTag || (OrientationTag = {}));
/**
 * Utility to display image preview as base64 string
 * Provides basic implementation to keep .jepg rotation
 * Calculations uses lazy-loading
 */
class OrientedImage {
    constructor(file) {
        // original file as base64 string
        this.originalFileUrl = '';
        // original file ip-oriented, as base64 string
        this.upFileUrl = '';
        // current orientation of original file
        this.orientation = OrientationTag.Undefined;
        if (!file) {
            throw new Error('File is not defined or null');
        }
        this.originalFile = file;
    }
    /**
     * Return original file as base 64 url
     * will launch file loading if needed
     * @return {Promise<string>} fileUrl
     */
    getOriginalFileUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.originalFileUrl !== '' ? this.originalFileUrl : this.loadAsDataUrl();
        });
    }
    /**
     * Return original file up-oriented as base 64 url
     * will launch file loading & orientation calculation if needed
     * @return {Promise<{ url: string, blob: Blob}>} fileUrl
     */
    getFile() {
        return __awaiter(this, void 0, void 0, function* () {
            const base64 = yield this.getOriginalFileUrl();
            const orientation = yield this.getOrientation();
            // if image is already up-oriented, no need for calculation
            if (orientation === OrientationTag.Up) {
                return { url: base64, blob: this.originalFile };
            }
            // calculate up-oriented image only once
            return this.upFileUrl !== ''
                ? { url: this.upFileUrl, blob: this.upOrientedfile }
                : this.calculateUpOrientedImage(base64, orientation);
        });
    }
    /**
     * Image loading as Data url
     */
    loadAsDataUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.originalFileUrl = event.target.result;
                    resolve(this.originalFileUrl);
                };
                reader.onerror = (error) => {
                    reject(error);
                };
                reader.readAsDataURL(this.originalFile);
            });
        });
    }
    /**
     * Image loading as array buffer
     * @return {Promise<DataView>}
     */
    loadAsArrayBuffer() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const buffer = new DataView(event.target.result);
                    resolve(buffer);
                };
                reader.onerror = (error) => {
                    reject(error);
                };
                reader.readAsArrayBuffer(this.originalFile);
            });
        });
    }
    /**
     * Retrieves orientation tag for original file
     * @return {Promise<OrientationTag>}
     */
    getOrientation() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.orientation === OrientationTag.Undefined) {
                const buffer = yield this.loadAsArrayBuffer();
                this.orientation = yield this.calculateOrientationTag(buffer);
            }
            return this.orientation;
        });
    }
    /**
     * Simple algo to detect basic orientation for .jpeg
     * https://stackoverflow.com/questions/7584794/accessing-jpeg-exif-rotation-data-in-javascript-on-the-client-side/32490603#32490603
     * The algo we use do not sees mirrored values, it also swaps left & rights values
     * @param {DataView} buffer
     * @return {Promise<OrientationTag>}
     */
    calculateOrientationTag(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
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
                }
                else if ((marker & 0xFF00) !== 0xFF00) {
                    break;
                }
                else {
                    offset += buffer.getUint16(offset, false);
                }
            }
            return OrientationTag.Undefined;
        });
    }
    /**
     * Provide an up oriented image from
     * @param {string} base64 : the original image in base64 string
     * @param {OrientationTag} orientation : the current orientation
     * @return {Promise<string>}
     */
    calculateUpOrientedImage(base64, orientation) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    const width = img.width;
                    const height = img.height;
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    // not a valid context for drawing : fallback to original image
                    if (!ctx) {
                        resolve({ url: base64, blob: this.originalFile });
                        return;
                    }
                    // set proper canvas dimensions before transform & export
                    if (4 < orientation && orientation < 9) {
                        canvas.width = height;
                        canvas.height = width;
                    }
                    else {
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
                    canvas.toBlob((result) => {
                        this.upOrientedfile = result;
                        resolve({ url: upBase64, blob: result });
                    });
                };
                img.onerror = (error) => reject(error);
                img.src = base64;
            });
        });
    }
}
exports.default = OrientedImage;
