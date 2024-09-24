const express = require('express');
const { fetchExternalAPI } = require('../controllers/apiController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.send({ message: 'OK' });
});

router.get('/api/:term', fetchExternalAPI);

module.exports = router;
