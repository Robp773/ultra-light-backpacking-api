'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/api/*', (req, res) => {
  res.json({ok: 'yas'});
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = {app};