// Custom Module for Date and Time
exports.getDate = function() {
  // Refer to toLocaleDateString Documentation online
  const today = new Date();
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };
  return today.toLocaleDateString(undefined, options);
}

exports.getDay = function() {
  const today = new Date();
  const options = {
    weekday: "long"
  };
  return today.toLocaleDateString(undefined, options);
}
