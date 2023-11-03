const express = require('express');
const router = express.Router();

// GET Root Route
module.exports = function () {
  router.get('/rows', function (req, res, next) {
    const data = req.flash('data');

    res.render('index', {
      req: req,
      columns: [],
      data
    });

  });

  return router;
}
