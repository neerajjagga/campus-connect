function formatDate(date) {
  if (!date) return "";

  const d = new Date(date);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12; // convert 0 → 12, 13 → 1, etc.

  return `${hours}:${minutes} ${ampm}`;
}

export default formatDate;