var curLatLongDis;
var myLatLng = [];
var map;
var defaultDistance = 0.7;
var currentPositionMarker;
var myMarker = [];
var geocoder;

$("#searchAddress").on("click touchstart", function searchAddress() {
  console.log("firing");
  var address = $("#address");
  geocoder.geocode({ address: address.val() }, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      var location = results[0].geometry.location;
      setCurrentPos(location);
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
});

function addCustomMarker(data) {
  var image = "./bierhand.png";

  window.setTimeout(function() {
    myMarker.push(
      new google.maps.Marker({
        position: data.Position,
        title: data.Name,
        map: map,
        animation: google.maps.Animation.DROP,
        icon: {
          url: image,
          scaledSize: {
            width: 60,
            height: 60
          }
        }
      })
    );
  }, data.Index * 200);
}

function clearMap() {
  if (myMarker.length) {
    myMarker.forEach(indivMarker => {
      indivMarker.setMap(null); //dem Marker wird an dieser Stelle keine Map mehr zugeordnet
    });
    myMarker = [];
  }
}
// url: "http://m.spätifinder.de/apiv2/?" + token + curLatLongDis,

function loadSpaetis(location) {
  var curLatLongDis = getDistanceFromCurrentLocation(location);
  console.log(curLatLongDis);
  const reqSpaetis = $.ajax({
    url: "/results" + curLatLongDis,
    method: "GET",
    type: "application/json",
    success: function(dataList) {
      console.log("Results for spätis", typeof dataList);

      clearMap();

      dataList.forEach((data, index) => {
        var latlng = new google.maps.LatLng(
          parseFloat(data.Lat),
          parseFloat(data.Long)
        );

        addCustomMarker({
          Name: data.Name,
          Position: latlng,
          Index: index //nötig für das setTimeout
        });
      });
    },
    error: function() {
      alert("boom");
    }
  });
}

function getDistanceFromCurrentLocation(location) {
  return (
    "?&lat=" +
    location.lat() +
    "&long=" +
    location.lng() +
    "&distance=" +
    defaultDistance
  );
}

function geoFindMe() {
  console.log("NAVIGATOR FIRING");
  initMap();

  function success(position) {
    console.log("SUCCESS!");
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    console.log("curcatlongdis", curLatLongDis);
    var location = new google.maps.LatLng(latitude, longitude);
    setCurrentPos(location);
  }

  function error() {
    latitude = 52.520007;
    longitude = 13.404954;
    console.log("ACCESS DENIED. DEFAULT POS", latitude, longitude);
    var location = new google.maps.LatLng(latitude, longitude);
    setCurrentPos(location);
  }

  navigator.geolocation.getCurrentPosition(success, error);
}

function initMap() {
  geocoder = new google.maps.Geocoder();
  var myOptions = {
    zoom: 16
  };

  map = new google.maps.Map(document.getElementById("map"), myOptions);

  map.addListener("dragend", mapDragendEventFunction);
}

//lädt die Spätis für die Mitte der Karte nach dem Ziehen
function mapDragendEventFunction(event) {
  var location = map.getCenter();
  loadSpaetis(location);
}

function setCurrentPos(location) {
  map.setCenter(location);

  if (currentPositionMarker) {
    currentPositionMarker.setPosition(location);
  } else {
    var image = "./here.png";

    currentPositionMarker = new google.maps.Marker({
      position: location,
      map: map,
      icon: {
        url: image,
        scaledSize: {
          width: 50,
          height: 50
        }
      },
      title: "You are here"
    });
  }

  loadSpaetis(location);
}
