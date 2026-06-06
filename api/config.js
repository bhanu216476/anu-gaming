const { json, nextTournamentAt } = require('./_lib');

module.exports = function handler(_req, res) {
  json(res, 200, {
    projectName: '@nu gaming',
    nextTournamentAt: nextTournamentAt(),
    stats: {
      players: '2500+',
      teams: '200+',
      tournaments: '75+',
      prizePool: '₹5L+'
    }
  });
};