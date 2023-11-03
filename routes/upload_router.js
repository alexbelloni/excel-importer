const express = require('express');
const router = express.Router();
const xlsxToEmployeeHours = require('../entities/xlsxToEmployeeHours');

module.exports = function (upload) {
  function setFlashMessage(req, type, msg){
    req.flash(type, msg);
  }

  function getFlashMessage(req, type){    
    const obj = req.flash(type);
    const value = obj && typeof obj === 'object' ? obj[0] : obj;
    return value;
  }

  router.get('/', (req, res) => {
      const error = getFlashMessage(req, 'error');
      const success = getFlashMessage(req, 'success');
      res.render('upload', {
        req,
        error,
        success
      });
  });

  router.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) {
      setFlashMessage(req, 'error', 'No file selected');
      return res.redirect('/');
    }

    if (!['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(req.file.mimetype)) {
      setFlashMessage(req, 'error', 'Invalid file format. Please upload a CSV or Excel spreadsheet file.');
      return res.redirect('/');
    }

    if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {      
      const x = xlsxToEmployeeHours.convert(req.file.buffer);
      setFlashMessage(req, 'data', x.data);
    }

    try {
      setFlashMessage(req, 'success', 'Your data was uploaded successfully!');
      res.redirect('/rows');
    } catch (error) {
      setFlashMessage(req, 'error', 'There was an error importing data.');
      res.redirect('/?uploadSuccess=false');
    }
  });

  return router;
};
