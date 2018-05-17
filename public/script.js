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
var watchID;
var geoLoc;
var watchPositionMarker;
var myLocation;

function init() {
  initMap();
  geoFindMe();
  // getLocationUpdate();
}

$("#searchAddress").on("click", function searchAddress() {
  var address = $("#address");
  geocoder.geocode({ address: address.val() }, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      myGeoLoc = results[0].geometry.location;
      myLocation = myGeoLoc;
      setCurrentPos(myLocation);
      address.val("");
    } else {
      alert("Geocode was not successful for the following reason: " + status);
      address.val("");
    }
  });
});

async function addCustomMarker(data) {
  var image = "./beerinhand.png";

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
    $("#modal").css("display", "block");
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
    var minutes = Math.round(meter / 60);
    var listOfItems = "";
    singleMarker.Offer.forEach(item => {
      listOfItems += `${item.Caption}, `;
    });

    $(".name").html(singleMarker.Name);
    $(".spaetiAddress").html(singleMarker.Address);
    $(".addressLink").attr(
      "href",
      `https://maps.google.com/?daddr=${singleMarker.position}`
    );

    $(".addLinkDir").attr(
      "href",
      `https://maps.google.com/maps?saddr=${myGeoLoc}&daddr=${
        singleMarker.position
      }`
    );

    $(".distance").html(`Ca. ${meter} meters`);
    $(".distanceTime").html(`Ca. ${minutes} minutes to walk`);
    $(".offer").html(listOfItems);

    if (singleMarker.Opening.includes("unbekannt")) {
      $(".openingHours").html("not provided");
    } else {
      $(".openingHours").html(singleMarker.Opening);
    }
  });
  closePopup();
}

function closePopup() {
  $("#closeTag").on("click touchstart", function() {
    $("#modal").fadeOut(
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

  $("#modal").on("click touchstart", function() {
    if ($(".modal-body").css("display", "block")) {
      $("#modal").fadeOut(
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
    }

    // $(".modal-body").css("display", "none");
  });
}

$(".menuContainer").on("click", function toggleMenu() {
  if ($(".menu").css("display") == "none") {
    $(".menu").slideToggle("slow", function() {
      $(".menu").css("display", "block");
    });
  } else {
    $(".menu").slideToggle("slow", function() {
      $(".menu").css("display", "none");
    });
  }
  // $(".menu").toggle(500);
});

function loadSpaetis(myLocation) {
  var curLatLongDis = getGeoSearchParams(
    myLocation,
    distance || defaultDistance
  );
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

// function getGeoSearchParams(location, distance) {
//   console.log("DEF DISTANCE", distance);
//   return (
//     "?&lat=" +
//     location.lat() +
//     "&long=" +
//     location.lng() +
//     "&distance=" +
//     distance
//   );
// }

function geoFindMe() {
  navigator.geolocation.getCurrentPosition(success, error, {
    enableHighAccuracy: true,
    timeout: 5000
  });

  function success(position) {
    console.log("SUCCESS!");
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    myGeoLoc = new google.maps.LatLng(latitude, longitude);
    myLocation = myGeoLoc;
    console.log("My geo loc", myGeoLoc);
    console.log("my Location", myLocation);
    setCurrentPos(myLocation);
    // getLocationUpdate();
  }

  function error(failure) {
    latitude = 52.520007;
    longitude = 13.404954;
    console.log("ACCESS DENIED. DEFAULT POS", latitude, longitude);
    myGeoLoc = new google.maps.LatLng(latitude, longitude);
    myLocation = myGeoLoc;

    if (failure.message.indexOf("Only secure origins are allowed") == 0) {
      alert(
        "We were unable to find your current position. Use the address search field to get Spätis near you."
      );
    }
    setCurrentPos(myLocation);
  }
}

function getLocationUpdate(myLocation) {
  // if (navigator.geolocation) {
  // timeout at 60000 milliseconds (60 seconds)
  var options = { timeout: 60000 };
  geoLoc = navigator.geolocation;
  watchID = geoLoc.watchPosition(
    position => {
      console.log("GEtting watch pos");
      var icon = "./manup-icon.png";
      watchPositionMarker = new google.maps.Marker({
        position: myLocation,
        map: map,
        icon: {
          url: icon,
          scaledSize: {
            width: 100,
            height: 100
          }
        },
        title: "You are here"
      });
      console.log(position, map);
    },
    errorHandler,
    watchPositionMarker
  );
  // } else {
  //   alert("Sorry, browser does not support geolocation!");
  // }
}

function errorHandler(err) {
  if (err.code == 1) {
    alert("Error: Access is denied!");
  } else if (err.code == 2) {
    alert("Error: Position is unavailable!");
  }
}

function initMap() {
  geocoder = new google.maps.Geocoder();
  map = new google.maps.Map(document.getElementById("map"), { zoom: 16 });
  map.addListener("dragstart", mapDragstartEventFunction);
  map.addListener("dragend", mapDragendEventFunction);
  map.addListener("zoom_changed", zoomFunction);
}

function mapDragstartEventFunction() {
  startingPoint = map.getCenter();
}

//lädt die Spätis für die Mitte der Karte nach dem Ziehen
function mapDragendEventFunction(e) {
  myLocation = map.getCenter();
  console.log("Start ud End", startingPoint, myLocation);
  var p2pDistance = google.maps.geometry.spherical.computeDistanceBetween(
    startingPoint,
    myLocation
  );
  if (p2pDistance > 450) {
    clearMap();
  }
  console.log("DIST", p2pDistance);
  loadSpaetis(myLocation);
}

function clearMap() {
  if (myMarker.length) {
    myMarker.forEach(indivMarker => {
      indivMarker.setMap(null); //dem Marker wird an dieser Stelle keine Map mehr zugeordnet
    });
    myMarker = [];
  }
}

function setCurrentPos(myLcation) {
  map.setCenter(myLcation);
  if (currentPositionMarker) {
    currentPositionMarker.setPosition(myLcation);
  } else {
    var image = "./here.png";
    currentPositionMarker = new google.maps.Marker({
      position: myLcation,
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
  loadSpaetis(myLocation);
}

function zoomFunction() {
  myLocation = map.getCenter();
  console.log("LOCATIONN in zoomfn", myLocation);
  var userZoom = map.getZoom();
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
  console.log("DISTANCE", distance);
  loadSpaetis(myLocation);
}
