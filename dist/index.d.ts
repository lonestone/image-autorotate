/**
 * Utility to display image preview as base64 string
 * Provides basic implementation to keep .jepg rotation
 * Calculations uses lazy-loading
 */
export default class OrientedImage {
    private originalFile;
    private upOrientedfile;
    private originalFileUrl;
    private upFileUrl;
    private orientation;
    constructor(file: File);
    /**
     * Return original file as base 64 url
     * will launch file loading if needed
     * @return {Promise<string>} fileUrl
     */
    getOriginalFileUrl(): Promise<string>;
    /**
     * Return original file up-oriented as base 64 url
     * will launch file loading & orientation calculation if needed
     * @return {Promise<{ url: string, blob: Blob}>} fileUrl
     */
    getFile(): Promise<{
        url: string;
        blob: Blob;
    }>;
    /**
     * Image loading as Data url
     */
    private loadAsDataUrl();
    /**
     * Image loading as array buffer
     * @return {Promise<DataView>}
     */
    private loadAsArrayBuffer();
    /**
     * Retrieves orientation tag for original file
     * @return {Promise<OrientationTag>}
     */
    private getOrientation();
    /**
     * Simple algo to detect basic orientation for .jpeg
     * https://stackoverflow.com/questions/7584794/accessing-jpeg-exif-rotation-data-in-javascript-on-the-client-side/32490603#32490603
     * The algo we use do not sees mirrored values, it also swaps left & rights values
     * @param {DataView} buffer
     * @return {Promise<OrientationTag>}
     */
    private calculateOrientationTag(buffer);
    /**
     * Provide an up oriented image from
     * @param {string} base64 : the original image in base64 string
     * @param {OrientationTag} orientation : the current orientation
     * @return {Promise<string>}
     */
    private calculateUpOrientedImage(base64, orientation);
}
