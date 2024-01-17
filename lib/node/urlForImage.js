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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSource = exports.SPEC_NAME_TO_URL_NAME_MAPPINGS = void 0;
var parseAssetId_1 = __importDefault(require("./parseAssetId"));
var parseSource_1 = __importDefault(require("./parseSource"));
exports.parseSource = parseSource_1.default;
exports.SPEC_NAME_TO_URL_NAME_MAPPINGS = [
    ['width', 'w'],
    ['height', 'h'],
    ['format', 'fm'],
    ['download', 'dl'],
    ['blur', 'blur'],
    ['sharpen', 'sharp'],
    ['invert', 'invert'],
    ['orientation', 'or'],
    ['minHeight', 'min-h'],
    ['maxHeight', 'max-h'],
    ['minWidth', 'min-w'],
    ['maxWidth', 'max-w'],
    ['quality', 'q'],
    ['fit', 'fit'],
    ['crop', 'crop'],
    ['saturation', 'sat'],
    ['auto', 'auto'],
    ['dpr', 'dpr'],
    ['pad', 'pad'],
];
function urlForImage(options) {
    var spec = __assign({}, (options || {}));
    var source = spec.source;
    delete spec.source;
    var image = (0, parseSource_1.default)(source);
    if (!image) {
        throw new Error("Unable to resolve image URL from source (".concat(JSON.stringify(source), ")"));
    }
    var id = image.asset._ref || image.asset._id || '';
    var asset = (0, parseAssetId_1.default)(id);
    // Compute crop rect in terms of pixel coordinates in the raw source image
    var cropLeft = Math.round(image.crop.left * asset.width);
    var cropTop = Math.round(image.crop.top * asset.height);
    var crop = {
        left: cropLeft,
        top: cropTop,
        width: Math.round(asset.width - image.crop.right * asset.width - cropLeft),
        height: Math.round(asset.height - image.crop.bottom * asset.height - cropTop),
    };
    // Compute hot spot rect in terms of pixel coordinates
    var hotSpotVerticalRadius = (image.hotspot.height * asset.height) / 2;
    var hotSpotHorizontalRadius = (image.hotspot.width * asset.width) / 2;
    var hotSpotCenterX = image.hotspot.x * asset.width;
    var hotSpotCenterY = image.hotspot.y * asset.height;
    var hotspot = {
        left: hotSpotCenterX - hotSpotHorizontalRadius,
        top: hotSpotCenterY - hotSpotVerticalRadius,
        right: hotSpotCenterX + hotSpotHorizontalRadius,
        bottom: hotSpotCenterY + hotSpotVerticalRadius,
    };
    // If irrelevant, or if we are requested to: don't perform crop/fit based on
    // the crop/hotspot.
    if (!(spec.rect || spec.focalPoint || spec.ignoreImageParams || spec.crop)) {
        spec = __assign(__assign({}, spec), fit({ crop: crop, hotspot: hotspot }, spec));
    }
    return specToImageUrl(__assign(__assign({}, spec), { asset: asset }));
}
exports.default = urlForImage;
// eslint-disable-next-line complexity
function specToImageUrl(spec) {
    var _a;
    var cdnUrl = (spec.baseUrl || 'https://cdn.sanity.io').replace(/\/+$/, '');
    var filename = "".concat(spec.asset.id, "-").concat(spec.asset.width, "x").concat(spec.asset.height, ".").concat(spec.asset.format);
    var dataset = (_a = process.env.SANITY_STUDIO_IMAGE_DATASET_OVERRIDE) !== null && _a !== void 0 ? _a : spec.dataset;
    var baseUrl = "".concat(cdnUrl, "/images/").concat(spec.projectId, "/").concat(dataset, "/").concat(filename);
    var params = [];
    if (spec.rect) {
        // Only bother url with a crop if it actually crops anything
        var _b = spec.rect, left = _b.left, top_1 = _b.top, width = _b.width, height = _b.height;
        var isEffectiveCrop = left !== 0 || top_1 !== 0 || height !== spec.asset.height || width !== spec.asset.width;
        if (isEffectiveCrop) {
            params.push("rect=".concat(left, ",").concat(top_1, ",").concat(width, ",").concat(height));
        }
    }
    if (spec.bg) {
        params.push("bg=".concat(spec.bg));
    }
    if (spec.focalPoint) {
        params.push("fp-x=".concat(spec.focalPoint.x));
        params.push("fp-y=".concat(spec.focalPoint.y));
    }
    var flip = [spec.flipHorizontal && 'h', spec.flipVertical && 'v'].filter(Boolean).join('');
    if (flip) {
        params.push("flip=".concat(flip));
    }
    // Map from spec name to url param name, and allow using the actual param name as an alternative
    exports.SPEC_NAME_TO_URL_NAME_MAPPINGS.forEach(function (mapping) {
        var specName = mapping[0], param = mapping[1];
        if (typeof spec[specName] !== 'undefined') {
            params.push("".concat(param, "=").concat(encodeURIComponent(spec[specName])));
        }
        else if (typeof spec[param] !== 'undefined') {
            params.push("".concat(param, "=").concat(encodeURIComponent(spec[param])));
        }
    });
    if (params.length === 0) {
        return baseUrl;
    }
    return "".concat(baseUrl, "?").concat(params.join('&'));
}
function fit(source, spec) {
    var cropRect;
    var imgWidth = spec.width;
    var imgHeight = spec.height;
    // If we are not constraining the aspect ratio, we'll just use the whole crop
    if (!(imgWidth && imgHeight)) {
        return { width: imgWidth, height: imgHeight, rect: source.crop };
    }
    var crop = source.crop;
    var hotspot = source.hotspot;
    // If we are here, that means aspect ratio is locked and fitting will be a bit harder
    var desiredAspectRatio = imgWidth / imgHeight;
    var cropAspectRatio = crop.width / crop.height;
    if (cropAspectRatio > desiredAspectRatio) {
        // The crop is wider than the desired aspect ratio. That means we are cutting from the sides
        var height = Math.round(crop.height);
        var width = Math.round(height * desiredAspectRatio);
        var top_2 = Math.max(0, Math.round(crop.top));
        // Center output horizontally over hotspot
        var hotspotXCenter = Math.round((hotspot.right - hotspot.left) / 2 + hotspot.left);
        var left = Math.max(0, Math.round(hotspotXCenter - width / 2));
        // Keep output within crop
        if (left < crop.left) {
            left = crop.left;
        }
        else if (left + width > crop.left + crop.width) {
            left = crop.left + crop.width - width;
        }
        cropRect = { left: left, top: top_2, width: width, height: height };
    }
    else {
        // The crop is taller than the desired ratio, we are cutting from top and bottom
        var width = crop.width;
        var height = Math.round(width / desiredAspectRatio);
        var left = Math.max(0, Math.round(crop.left));
        // Center output vertically over hotspot
        var hotspotYCenter = Math.round((hotspot.bottom - hotspot.top) / 2 + hotspot.top);
        var top_3 = Math.max(0, Math.round(hotspotYCenter - height / 2));
        // Keep output rect within crop
        if (top_3 < crop.top) {
            top_3 = crop.top;
        }
        else if (top_3 + height > crop.top + crop.height) {
            top_3 = crop.top + crop.height - height;
        }
        cropRect = { left: left, top: top_3, width: width, height: height };
    }
    return {
        width: imgWidth,
        height: imgHeight,
        rect: cropRect,
    };
}
//# sourceMappingURL=urlForImage.js.map