function getGeoSearchParams(location, distance) {
  console.log("DEF DISTANCE", distance);
  return (
    "?&lat=" +
    location.lat() +
    "&long=" +
    location.lng() +
    "&distance=" +
    distance
  );
}

try {
  module.exports = getGeoSearchParams;
} catch (e) {}
