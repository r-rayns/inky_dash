const { validationResult } = require('express-validator');
const { msgOnly } = require('../helpers/errorFormatters');

module.exports.validationErrorHandler = function (req, res, next) {
  const errors = validationResult(req).formatWith(msgOnly).array();
  if (errors.length) {
    res.status(400).json({ success: false, errors });
  } else {
    next();
  }
}
