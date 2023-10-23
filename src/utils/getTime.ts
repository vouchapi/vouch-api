export function getPreviousFridayDate() {
  const currentDate = new Date();
  const currentDay = currentDate.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday

  // Calculate the number of days to subtract to get to the previous Friday
  const daysToSubtract = (currentDay + 1) % 7; // +2 to make Sunday (0) go back to Friday (5)

  // Set the time to 4:00 AM
  currentDate.setHours(4, 0, 0, 0);

  // Subtract the calculated days to get the previous Friday
  currentDate.setDate(currentDate.getDate() - daysToSubtract);

  return currentDate;
}
