"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageUrlBuilder = void 0;
var urlForImage_1 = __importStar(require("./urlForImage"));
var validFits = ['clip', 'crop', 'fill', 'fillmax', 'max', 'scale', 'min'];
var validCrops = ['top', 'bottom', 'left', 'right', 'center', 'focalpoint', 'entropy'];
var validAutoModes = ['format'];
function isSanityModernClientLike(client) {
    return client && 'config' in client ? typeof client.config === 'function' : false;
}
function isSanityClientLike(client) {
    return client && 'clientConfig' in client ? typeof client.clientConfig === 'object' : false;
}
function rewriteSpecName(key) {
    var specs = urlForImage_1.SPEC_NAME_TO_URL_NAME_MAPPINGS;
    for (var _i = 0, specs_1 = specs; _i < specs_1.length; _i++) {
        var entry = specs_1[_i];
        var specName = entry[0], param = entry[1];
        if (key === specName || key === param) {
            return specName;
        }
    }
    return key;
}
function urlBuilder(options) {
    // Did we get a modernish client?
    if (isSanityModernClientLike(options)) {
        // Inherit config from client
        var _a = options.config(), apiUrl = _a.apiHost, projectId = _a.projectId, dataset = _a.dataset;
        var apiHost = apiUrl || 'https://api.sanity.io';
        return new ImageUrlBuilder(null, {
            baseUrl: apiHost.replace(/^https:\/\/api\./, 'https://cdn.'),
            projectId: projectId,
            dataset: dataset,
        });
    }
    // Did we get a SanityClient?
    var client = options;
    if (isSanityClientLike(client)) {
        // Inherit config from client
        var _b = client.clientConfig, apiUrl = _b.apiHost, projectId = _b.projectId, dataset = _b.dataset;
        var apiHost = apiUrl || 'https://api.sanity.io';
        return new ImageUrlBuilder(null, {
            baseUrl: apiHost.replace(/^https:\/\/api\./, 'https://cdn.'),
            projectId: projectId,
            dataset: dataset,
        });
    }
    // Or just accept the options as given
    return new ImageUrlBuilder(null, options);
}
exports.default = urlBuilder;
var ImageUrlBuilder = /** @class */ (function () {
    function ImageUrlBuilder(parent, options) {
        this.options = parent
            ? __assign(__assign({}, (parent.options || {})), (options || {})) : __assign({}, (options || {})); // Copy options
    }
    ImageUrlBuilder.prototype.withOptions = function (options) {
        var baseUrl = options.baseUrl || this.options.baseUrl;
        var newOptions = { baseUrl: baseUrl };
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                var specKey = rewriteSpecName(key);
                newOptions[specKey] = options[key];
            }
        }
        return new ImageUrlBuilder(this, __assign({ baseUrl: baseUrl }, newOptions));
    };
    // The image to be represented. Accepts a Sanity 'image'-document, 'asset'-document or
    // _id of asset. To get the benefit of automatic hot-spot/crop integration with the content
    // studio, the 'image'-document must be provided.
    ImageUrlBuilder.prototype.image = function (source) {
        return this.withOptions({ source: source });
    };
    // Specify the dataset
    ImageUrlBuilder.prototype.dataset = function (dataset) {
        return this.withOptions({ dataset: dataset });
    };
    // Specify the projectId
    ImageUrlBuilder.prototype.projectId = function (projectId) {
        return this.withOptions({ projectId: projectId });
    };
    // Specify background color
    ImageUrlBuilder.prototype.bg = function (bg) {
        return this.withOptions({ bg: bg });
    };
    // Set DPR scaling factor
    ImageUrlBuilder.prototype.dpr = function (dpr) {
        // A DPR of 1 is the default - so only include it if we have a different value
        return this.withOptions(dpr && dpr !== 1 ? { dpr: dpr } : {});
    };
    // Specify the width of the image in pixels
    ImageUrlBuilder.prototype.width = function (width) {
        return this.withOptions({ width: width });
    };
    // Specify the height of the image in pixels
    ImageUrlBuilder.prototype.height = function (height) {
        return this.withOptions({ height: height });
    };
    // Specify focal point in fraction of image dimensions. Each component 0.0-1.0
    ImageUrlBuilder.prototype.focalPoint = function (x, y) {
        return this.withOptions({ focalPoint: { x: x, y: y } });
    };
    ImageUrlBuilder.prototype.maxWidth = function (maxWidth) {
        return this.withOptions({ maxWidth: maxWidth });
    };
    ImageUrlBuilder.prototype.minWidth = function (minWidth) {
        return this.withOptions({ minWidth: minWidth });
    };
    ImageUrlBuilder.prototype.maxHeight = function (maxHeight) {
        return this.withOptions({ maxHeight: maxHeight });
    };
    ImageUrlBuilder.prototype.minHeight = function (minHeight) {
        return this.withOptions({ minHeight: minHeight });
    };
    // Specify width and height in pixels
    ImageUrlBuilder.prototype.size = function (width, height) {
        return this.withOptions({ width: width, height: height });
    };
    // Specify blur between 0 and 100
    ImageUrlBuilder.prototype.blur = function (blur) {
        return this.withOptions({ blur: blur });
    };
    ImageUrlBuilder.prototype.sharpen = function (sharpen) {
        return this.withOptions({ sharpen: sharpen });
    };
    // Specify the desired rectangle of the image
    ImageUrlBuilder.prototype.rect = function (left, top, width, height) {
        return this.withOptions({ rect: { left: left, top: top, width: width, height: height } });
    };
    // Specify the image format of the image. 'jpg', 'pjpg', 'png', 'webp'
    ImageUrlBuilder.prototype.format = function (format) {
        return this.withOptions({ format: format });
    };
    ImageUrlBuilder.prototype.invert = function (invert) {
        return this.withOptions({ invert: invert });
    };
    // Rotation in degrees 0, 90, 180, 270
    ImageUrlBuilder.prototype.orientation = function (orientation) {
        return this.withOptions({ orientation: orientation });
    };
    // Compression quality 0-100
    ImageUrlBuilder.prototype.quality = function (quality) {
        return this.withOptions({ quality: quality });
    };
    // Make it a download link. Parameter is default filename.
    ImageUrlBuilder.prototype.forceDownload = function (download) {
        return this.withOptions({ download: download });
    };
    // Flip image horizontally
    ImageUrlBuilder.prototype.flipHorizontal = function () {
        return this.withOptions({ flipHorizontal: true });
    };
    // Flip image vertically
    ImageUrlBuilder.prototype.flipVertical = function () {
        return this.withOptions({ flipVertical: true });
    };
    // Ignore crop/hotspot from image record, even when present
    ImageUrlBuilder.prototype.ignoreImageParams = function () {
        return this.withOptions({ ignoreImageParams: true });
    };
    ImageUrlBuilder.prototype.fit = function (value) {
        if (validFits.indexOf(value) === -1) {
            throw new Error("Invalid fit mode \"".concat(value, "\""));
        }
        return this.withOptions({ fit: value });
    };
    ImageUrlBuilder.prototype.crop = function (value) {
        if (validCrops.indexOf(value) === -1) {
            throw new Error("Invalid crop mode \"".concat(value, "\""));
        }
        return this.withOptions({ crop: value });
    };
    // Saturation
    ImageUrlBuilder.prototype.saturation = function (saturation) {
        return this.withOptions({ saturation: saturation });
    };
    ImageUrlBuilder.prototype.auto = function (value) {
        if (validAutoModes.indexOf(value) === -1) {
            throw new Error("Invalid auto mode \"".concat(value, "\""));
        }
        return this.withOptions({ auto: value });
    };
    // Specify the number of pixels to pad the image
    ImageUrlBuilder.prototype.pad = function (pad) {
        return this.withOptions({ pad: pad });
    };
    // Gets the url based on the submitted parameters
    ImageUrlBuilder.prototype.url = function () {
        return (0, urlForImage_1.default)(this.options);
    };
    // Alias for url()
    ImageUrlBuilder.prototype.toString = function () {
        return this.url();
    };
    return ImageUrlBuilder;
}());
exports.ImageUrlBuilder = ImageUrlBuilder;
//# sourceMappingURL=builder.js.map