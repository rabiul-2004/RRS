const SEATS_PER_COACH = {
  SL: 80,
  '3A': 80,
  '2A': 60,
  '1A': 40,
  CC: 78,
  EC: 56,
  '2S': 108,
  FC: 50,
};

const COACH_PREFIX = {
  SL: 'S',
  '3A': 'B',
  '2A': 'A',
  '1A': 'H',
  CC: 'C',
  EC: 'E',
  '2S': 'D',
  FC: 'F',
};

module.exports = { SEATS_PER_COACH, COACH_PREFIX };
