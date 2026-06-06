const { json } = require('./_lib');

module.exports = function handler(_req, res) {
  json(res, 200, { status: 'ok', service: '@nu gaming vercel frontend' });
};