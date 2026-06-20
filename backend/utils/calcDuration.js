const calcDuration = (departureTime, arrivalTime) => {
  const [depH, depM] = departureTime.split(':').map(Number);
  const [arrH, arrM] = arrivalTime.split(':').map(Number);

  let depMinutes = depH * 60 + depM;
  let arrMinutes = arrH * 60 + arrM;

  if (arrMinutes <= depMinutes) {
    arrMinutes += 24 * 60;
  }

  const diffMinutes = arrMinutes - depMinutes;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
};

module.exports = calcDuration;
