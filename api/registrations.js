const { json, readRegistrations } = require('./_lib');

module.exports = function handler(_req, res) {
  const rows = readRegistrations();
  json(res, 200, { count: rows.length, data: rows });
};