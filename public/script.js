var curLatLongDis;
var myLatLng = [];
var map;
var defaultDistance = 0.6;
var distance;
var currentPositionMarker;
var myMarker = [];
var geocoder;
var reqSpaetis;
var meter;
var startingPoint;

function init() {
  initMap();
  geoFindMe();
}

$("#searchAddress").on("click touchstart", function searchAddress() {
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

async function addCustomMarker(data) {
  var image = "./beer.png";

  var singleMarker = await new google.maps.Marker({
    position: data.Position,
    Name: data.Name,
    id: data.id,
    Address: data.Address,
    Opening: data.Opening,
    Offer: data.Offer,
    Distance: data.Distance,
    map: map,
    // animation: google.maps.Animation.DROP,
    icon: {
      url: image,
      scaledSize: {
        width: 60,
        height: 60
      }
    }
  });
  // window.setTimeout(function() {
  myMarker.push(singleMarker);

  // }, data.Index * 200);

  singleMarker.addListener("click", function(e) {
    $(".modal").css("display", "block");

    $(".modal-body").animate(
      {
        display: "block",
        height: "toggle"
      },
      300,
      function() {
        console.log("Animation complete");
      }
    );

    meter = Math.round(singleMarker.Distance * 1000);
    var minutes = Math.round(meter / 1.2 / 60);
    var listOfItems = "";
    singleMarker.Offer.forEach(item => {
      listOfItems += `${item.Caption}, `;
    });

    $(".name").html(singleMarker.Name);
    $(".spaetiAddress").html(singleMarker.Address);
    $(".distance").html(`Ca. ${meter} meters`);
    $(".distanceTime").html(`Ca. ${minutes} minutes to walk`);
    $(".offer").html(listOfItems);

    if (singleMarker.Opening.includes("unbekannt")) {
      $(".openingHours").html("not provided");
    } else {
      $(".openingHours").html(singleMarker.Opening);
    }
  });

  $("#closeTag").on("click touchstart", function() {
    $(".modal").fadeOut(
      {
        display: "none",
        height: "toggle"
      },
      700,
      function() {
        console.log("Animation complete");
      }
    );

    $(".modal-body").css("display", "none");
    // $(".modal-body").css("display", "none");
  });
}

function loadSpaetis(location, distance) {
  var curLatLongDis = getGeoSearchParams(location, distance || defaultDistance);
  console.log("SUCHPARAMS", curLatLongDis);
  reqSpaetis = $.ajax({
    url: "/results" + curLatLongDis,
    method: "GET",
    type: "application/json",
    success: function(dataList) {
      console.log("DATALIST", dataList);
      dataList.forEach(data => addMarkerToMap(data));
    },
    error: function() {
      console.log("ERROR in loading Spätis");
    }
  });
}

function addMarkerToMap(data) {
  var latlng = new google.maps.LatLng(
    parseFloat(data.Lat),
    parseFloat(data.Long)
  );

  addCustomMarker({
    Name: data.Name,
    Address: data.Street,
    Opening: data.BusinessHours,
    Offer: data.tags,
    Distance: data.distance,
    id: data.ID,
    Position: latlng
    // Index: index //nötig für das setTimeout
  });
}

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

function geoFindMe() {
  navigator.geolocation.getCurrentPosition(success, error);

  function success(position) {
    console.log("SUCCESS!");
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
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
}

function initMap() {
  geocoder = new google.maps.Geocoder();
  map = new google.maps.Map(document.getElementById("map"), { zoom: 16 });
  map.addListener("dragstart", mapDragstartEventFunction);
  map.addListener("dragend", mapDragendEventFunction);
}

function mapDragstartEventFunction() {
  startingPoint = map.getCenter();
}

//lädt die Spätis für die Mitte der Karte nach dem Ziehen
function mapDragendEventFunction(e) {
  var location = map.getCenter();
  console.log("Start ud End", startingPoint, location);
  var p2pDistance = google.maps.geometry.spherical.computeDistanceBetween(
    startingPoint,
    location
  );
  if (p2pDistance > 450) {
    clearMap();
  }
  console.log("DIST", p2pDistance);
  loadSpaetis(location);
}

function clearMap() {
  if (myMarker.length) {
    myMarker.forEach(indivMarker => {
      indivMarker.setMap(null); //dem Marker wird an dieser Stelle keine Map mehr zugeordnet
    });
    myMarker = [];
  }
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

    // enableWatchPosition(location);
    // enableOrientationArrow(location);
  }
  loadSpaetis(location);
}

function zoomFunction(location) {
  map.addListener("zoom_changed", function() {
    var userZoom = map.getZoom();

    // infowindow.setContent("Zoom: " + map.getZoom());
    if (userZoom == 18) {
      distance = 0.4;
    }
    if (userZoom == 17) {
      distance = 0.5;
    }
    if (userZoom == 16) {
      distance = 0.7;
    }
    if (userZoom == 15) {
      distance = 0.9;
    }
    if (userZoom == 14) {
      distance = 1.1;
    }
    if (userZoom == 13) {
      distance = 1.3;
    }
    if (userZoom == 12) {
      distance = 1.5;
    }
    loadSpaetis(location);
  });
}

////////ORIENTATION Marker ///////////////////////
// var id, destination, options;
// var img = "./manup-icon.png";
// var myLocationMarker;
// //Verfolgen beginnen
// id = navigator.geolocation.watchPosition(function(position) {
//   watchMyPos,
//     ((destination = {
//       latitude: 0,
//       longitude: 0
//     }),
//     (options = {
//       enableHighAccuracy: false,
//       timeout: 500,
//       maximumAge: 0
//     }));
//   // myLocationMarker = new google.maps.Marker({
//   //   clickable: false,
//   //   icon: {
//   //     url: img,
//   //
//   //     scale: 2.5
//   //   },
//   //   shadow: null,
//   //   zIndex: 999,
//   //   map: map
//   // });
//   // console.log("myLocationMarker", myLocationMarker);
// });
//
// function watchMyPos(position) {
//   var currently = position.coords;
//   myLocationMarker = new google.maps.Marker({
//     clickable: false,
//     icon: {
//       url: img,
//
//       scale: 2.5
//     },
//     shadow: null,
//     zIndex: 999,
//     map: map
//   });
//   console.log("myLocationMarker", myLocationMarker);
//   console.log("TADAAAA");
//   // if (
//   //   destination.latitude === currently.latitude &&
//   //   destination.longitude === currently.longitude
//   // ) {
//   //   console.log("Sie haben Ihr Ziel erreicht");
//   //   //Verfolgen beenden
//   //   navigator.geolocation.clearWatch(id);
//   // }
// }
