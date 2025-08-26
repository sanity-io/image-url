export function imageWithNoCropSpecified() {
  return {
    _type: 'image',
    asset: {
      _ref: 'image-vK7bXJPEjVpL_C950gH1N73Zv14r7pYsbUdXl-4288x2848-jpg',
      _type: 'reference',
    },
  }
}

export function uncroppedImage() {
  return {
    _type: 'image',
    asset: {
      _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg',
      _type: 'reference',
    },
    crop: {
      bottom: 0.0,
      left: 0,
      right: 0,
      top: 0,
    },
    hotspot: {
      height: 0.3,
      width: 0.3,
      x: 0.3,
      y: 0.3,
    },
  }
}

export function materializedAssetWithCrop() {
  return {
    _type: 'image',
    asset: {
      _id: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg',
      _type: 'sanity.imageAsset',
      url: 'https://cdn.sanity.io/images/ppsg7ml5/test/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000.jpg',
    },
    crop: {
      bottom: 0.1,
      left: 0.1,
      right: 0.1,
      top: 0.1,
    },
    hotspot: {
      height: 0.3,
      width: 0.3,
      x: 0.3,
      y: 0.3,
    },
  }
}

export function croppedImage() {
  return {
    _type: 'image',
    asset: {
      _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg',
      _type: 'reference',
    },
    crop: {
      bottom: 0.1,
      left: 0.1,
      right: 0.1,
      top: 0.1,
    },
    hotspot: {
      height: 0.3,
      width: 0.3,
      x: 0.3,
      y: 0.3,
    },
  }
}

export function croppedLandscapeImageRounding() {
  return {
    _type: 'image',
    asset: {
      _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-3833x2555-jpg',
      _type: 'reference',
    },
    crop: {
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    },
    hotspot: {
      height: 0.7281480823863636,
      width: 0.48536873219336263,
      x: 0.5858922039336789,
      y: 0.3640740411931818,
    },
  }
}

export function croppedPortraitImageRounding() {
  return {
    _type: 'image',
    asset: {
      _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2555x3833-jpg',
      _type: 'reference',
    },
    crop: {
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    },
    hotspot: {
      width: 0.7281480823863636,
      height: 0.48536873219336263,
      x: 0.3640740411931818,
      y: 0.5858922039336789,
    },
  }
}

export function noHotspotImage() {
  return {
    _type: 'image',
    asset: {
      _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg',
      _type: 'reference',
    },
  }
}

export function assetWithUrl() {
  return {
    asset: {
      url: 'https://cdn.sanity.io/images/ppsg7ml5/test/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000.jpg',
    },
  }
}

export function assetDocument() {
  return {
    _id: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg',
    _type: 'sanity.imageAsset',
    assetId: 'Tb9Ew8CXIwaY6R1kjMvI0uRR',
    extension: 'jpg',
    metadata: {
      dimensions: {
        aspectRatio: 1.5,
        height: 3000,
        width: 2000,
      },
    },
    mimeType: 'image/jpeg',
    path: 'images/ppsg7ml5/test/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000.jpg',
    sha1hash: '075b7c7a434870280dab6613b3bf687988e36d75',
    size: 12233794,
    url: 'https://cdn.sanity.io/images/ppsg7ml5/test/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000.jpg',
  }
}

export function inProgressUpload() {
  return {
    _type: 'image',
    _upload: {
      _type: 'sanity.fileAsset',
      assetId: 'upload-123',
      // No asset reference yet - upload is in progress
    },
    // Missing asset reference
  }
}
