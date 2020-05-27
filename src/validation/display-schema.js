const maxByteLength = 3000000;
module.exports.imageUpload = {
  'image': {
    in: ['body'],
    errorMessage: 'Error uploading image',
    isBase64: {
      errorMessage: 'Image must be base64'
    },
    isLength: { // fast length check, done first
      errorMessage: 'File size can be no larger than 3MB',
      options: { max: maxByteLength * 2 }
    },
    custom: { // slow length check, done last, (anything massive should have been caught already)
      errorMessage: 'File size can be no larger than 3MB',
      options: (value) => {
        return Buffer.from(value).byteLength <= maxByteLength;
      }
    }
  },
  'palette_colour': {
    in: ['body'],
    errorMessage: 'Error setting palette colour',
    custom: {
      errorMessage: 'Palette colour must be either \'red\' or \'yellow\'',
      options: value => {
        return ['red', 'yellow'].includes(value)
      }
    }
  },
  'border_colour' : {
    in: ['body'],
    errorMessage: 'Error setting border colour',
    custom: {
      errorMessage: 'Border colour must be either \'white\' or \'black\'',
      options: value => {
        return ['white', 'black'].includes(value)
      }
    }
  }
};

