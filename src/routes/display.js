const express = require('express');
const router = express.Router();
const { Buffer } = require('buffer');
const Jimp = require('jimp');
const { checkSchema } = require('express-validator');
const jsonParser = express.json({ type: 'application/json' });
const { imageUpload } = require('../validation/display-schema');
const { validationErrorHandler } = require('../middleware/validationErrorHandler');
const { asyncErrorHandler, pythonScript } = require('../helpers/utility-functions');
const path = require('path');
const fs = require('fs').promises;

router.get('',
  asyncErrorHandler(async (req, res, next) => {
    const image_file = await fs
      .readFile(path.join(__dirname, '../../current_image/inky.png'));
    const image_base64 = new Buffer.from(image_file).toString('base64');
    res.status(200).send({ success: true, image: image_base64 });
  }));

router.post('/upload',
  jsonParser,
  checkSchema(imageUpload),
  validationErrorHandler,
  asyncErrorHandler(async (req, res, next) => {
    const image_buffer = new Buffer.from(req.body.image, 'base64');
    const image_read = await Jimp.read(image_buffer)
    await image_read
      .write(path.join(__dirname, '../../current_image/inky.png'));
    await pythonScript(
      path.join(__dirname, '../python-scripts/display-current-image.py'),
      req.body.palette_colour, req.body.border_colour);
    res.status(200).send({ success: true, image: req.body.image });
  }));

router.delete('/clear', (req, res, next) => {

});

module.exports = router;
