"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var OrientedImage = /** @class */ (function () {
    function OrientedImage(file) {
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
     * @return {Promise<{ur: string, blob: Blob}>}
     */
    OrientedImage.prototype.getOriginalFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.originalFileUrl === '')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadAsDataUrl()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, { url: this.originalFileUrl, blob: this.originalFile }];
                }
            });
        });
    };
    /**
     * Return original file up-oriented as base 64 url
     * will launch file loading & orientation calculation if needed
     * @return {Promise<{ url: string, blob: Blob}>} fileUrl
     */
    OrientedImage.prototype.getFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var originalFile, orientation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getOriginalFile()];
                    case 1:
                        originalFile = _a.sent();
                        return [4 /*yield*/, this.getOrientation()];
                    case 2:
                        orientation = _a.sent();
                        // if image is already up-oriented, no need for calculation
                        if (orientation === OrientationTag.Up) {
                            return [2 /*return*/, { url: originalFile.url, blob: this.originalFile }];
                        }
                        // calculate up-oriented image only once
                        return [2 /*return*/, this.upFileUrl !== ''
                                ? { url: this.upFileUrl, blob: this.upOrientedfile }
                                : this.calculateUpOrientedImage(originalFile.url, orientation)];
                }
            });
        });
    };
    /**
     * Image loading as Data url
     */
    OrientedImage.prototype.loadAsDataUrl = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var reader = new FileReader();
                        reader.onload = function (event) {
                            _this.originalFileUrl = event.target.result;
                            resolve(_this.originalFileUrl);
                        };
                        reader.onerror = function (error) {
                            reject(error);
                        };
                        reader.readAsDataURL(_this.originalFile);
                    })];
            });
        });
    };
    /**
     * Image loading as array buffer
     * @return {Promise<DataView>}
     */
    OrientedImage.prototype.loadAsArrayBuffer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var reader = new FileReader();
                        reader.onload = function (event) {
                            var buffer = new DataView(event.target.result);
                            resolve(buffer);
                        };
                        reader.onerror = function (error) {
                            reject(error);
                        };
                        reader.readAsArrayBuffer(_this.originalFile);
                    })];
            });
        });
    };
    /**
     * Retrieves orientation tag for original file
     * @return {Promise<OrientationTag>}
     */
    OrientedImage.prototype.getOrientation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var buffer, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.orientation === OrientationTag.Undefined)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.loadAsArrayBuffer()];
                    case 1:
                        buffer = _b.sent();
                        _a = this;
                        return [4 /*yield*/, this.calculateOrientationTag(buffer)];
                    case 2:
                        _a.orientation = _b.sent();
                        _b.label = 3;
                    case 3: return [2 /*return*/, this.orientation];
                }
            });
        });
    };
    /**
     * Simple algo to detect basic orientation for .jpeg
     * https://stackoverflow.com/questions/7584794/accessing-jpeg-exif-rotation-data-in-javascript-on-the-client-side/32490603#32490603
     * The algo we use do not sees mirrored values, it also swaps left & rights values
     * @param {DataView} buffer
     * @return {Promise<OrientationTag>}
     */
    OrientedImage.prototype.calculateOrientationTag = function (buffer) {
        return __awaiter(this, void 0, void 0, function () {
            var length, offset, marker, little, tags, i;
            return __generator(this, function (_a) {
                if (buffer.getUint16(0, false) !== 0xFFD8) {
                    return [2 /*return*/, OrientationTag.NotJpeg];
                }
                length = buffer.byteLength;
                offset = 2;
                while (offset < length) {
                    marker = buffer.getUint16(offset, false);
                    offset += 2;
                    if (marker === 0xFFE1) {
                        if (buffer.getUint32(offset += 2, false) !== 0x45786966) {
                            return [2 /*return*/, OrientationTag.Undefined];
                        }
                        little = buffer.getUint16(offset += 6, false) === 0x4949;
                        offset += buffer.getUint32(offset + 4, little);
                        tags = buffer.getUint16(offset, little);
                        offset += 2;
                        for (i = 0; i < tags; i++) {
                            if (buffer.getUint16(offset + (i * 12), little) === 0x0112) {
                                return [2 /*return*/, buffer.getUint16(offset + (i * 12) + 8, little)];
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
                return [2 /*return*/, OrientationTag.Undefined];
            });
        });
    };
    /**
     * Provide an up oriented image from
     * @param {string} base64 : the original image in base64 string
     * @param {OrientationTag} orientation : the current orientation
     * @return {Promise<string>}
     */
    OrientedImage.prototype.calculateUpOrientedImage = function (base64, orientation) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var img = new Image();
                        img.onload = function () { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            var width, height, canvas, ctx, upBase64;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        width = img.width;
                                        height = img.height;
                                        canvas = document.createElement('canvas');
                                        ctx = canvas.getContext('2d');
                                        if (!!canvas.toBlob) return [3 /*break*/, 2];
                                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../lib/javascript-canvas-to-blob.min.js'); })];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2:
                                        // not a valid context for drawing : fallback to original image
                                        if (!ctx) {
                                            resolve({ url: base64, blob: this.originalFile });
                                            return [2 /*return*/];
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
                                        upBase64 = canvas.toDataURL('image/jpeg');
                                        this.upFileUrl = upBase64;
                                        // export as blob & resolve
                                        canvas.toBlob(function (result) {
                                            _this.upOrientedfile = result;
                                            resolve({ url: upBase64, blob: result });
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        img.onerror = function (error) { return reject(error); };
                        img.src = base64;
                    })];
            });
        });
    };
    return OrientedImage;
}());
exports.default = OrientedImage;
