const generatePNR = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  let pnr = '';
  for (let i = 0; i < 3; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  for (let i = 0; i < 7; i++) {
    pnr += nums.charAt(Math.floor(Math.random() * nums.length));
  }
  return pnr;
};

module.exports = generatePNR;
