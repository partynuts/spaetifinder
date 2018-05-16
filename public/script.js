var curLatLongDis;
var myLatLng = [];
var map;
var defaultDistance = 0.6;
var currentPositionMarker;
var myMarker = [];
var geocoder;
var reqSpaetis;
var meter;
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

function clearMap() {
  if (myMarker.length) {
    myMarker.forEach(indivMarker => {
      indivMarker.setMap(null); //dem Marker wird an dieser Stelle keine Map mehr zugeordnet
    });
    myMarker = [];
  }
}

function loadSpaetis(location, defaultDistance) {
  if (reqSpaetis) {
    reqSpaetis.abort();
  }
  console.log("def dist", defaultDistance);
  var curLatLongDis = getDistanceFromCurrentLocation(location, defaultDistance);
  console.log("curcatlongdis in getDistanceFromCurrentLocation", curLatLongDis);
  reqSpaetis = $.ajax({
    url: "/results" + curLatLongDis,
    method: "GET",
    type: "application/json",
    success: function(dataList) {
      clearMap();
      console.log("DATALIST", dataList);
      dataList.forEach((data, index) => {
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
          Position: latlng,
          Index: index //nötig für das setTimeout
        });
      });
    },
    error: function() {
      console.log("ERROR in loading Spätis");
    }
  });
}

function getDistanceFromCurrentLocation(location, defaultDistance) {
  console.log("DEF DISTANCE", defaultDistance);
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
  initMap();

  function success(position) {
    console.log("SUCCESS!");
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    console.log("curcatlongdis", curLatLongDis);
    var location = new google.maps.LatLng(latitude, longitude);
    setCurrentPos(location);
    // enableWatchPosition(location);
    // enableOrientationArrow(location);
    // id;
    // watchMyPos(position);
    // console.log("watch my pos", watchMyPos);
    // console.log("id nav", id);
  }

  function error() {
    latitude = 52.520007;
    longitude = 13.404954;
    console.log("ACCESS DENIED. DEFAULT POS", latitude, longitude);
    var location = new google.maps.LatLng(latitude, longitude);
    setCurrentPos(location);
    // enableWatchPosition(location);
    // enableOrientationArrow(location);
  }

  navigator.geolocation.getCurrentPosition(success, error);
  // console.log(
  //   "NAVIGATOR",
  //   navigator.geolocation.getCurrentPosition(success, error)
  // );
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

function setCurrentPos(location, defaultDistance) {
  map.setCenter(location);
  zoomFunction(location);

  if (currentPositionMarker) {
    console.log("default distance 2", defaultDistance);

    currentPositionMarker.setPosition(location);
  } else {
    var infowindow = new google.maps.InfoWindow({
      content:
        `circles show distance within` +
        `\n` +
        `radius of 200, 400 & 600 meters`,
      position: location
    });

    console.log("default distance 1", defaultDistance);
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

    currentPositionMarker.addListener("click", function() {
      infowindow.open(map, circle);
    });

    var circle = new google.maps.Circle({
      map: map,
      radius: 200,
      fillColor: "#fdd6ce",
      fillOpacity: 0.1,
      strokeWeight: 1.5,
      strokeColor: "#fa9986",
      title: "INFOOOO"
    });
    var circle1 = new google.maps.Circle({
      map: map,
      radius: 400,
      fillColor: "#CCEEFF",
      strokeWeight: 1,
      strokeColor: "#006699"
    });
    var circle2 = new google.maps.Circle({
      map: map,
      radius: 600,
      fillColor: "#d1cadf",
      strokeWeight: 1,
      strokeColor: "#837798"
    });

    circle.bindTo("center", currentPositionMarker, "position");
    circle1.bindTo("center", currentPositionMarker, "position");
    circle2.bindTo("center", currentPositionMarker, "position");
  }

  loadSpaetis(location, 0.6);
  // enableWatchPosition(location);
  // enableOrientationArrow(location);
}

function zoomFunction(location) {
  console.log("ZOOMING");

  map.addListener("zoom_changed", function() {
    var userZoom = map.getZoom();
    console.log("User Zoom", userZoom);
    // infowindow.setContent("Zoom: " + map.getZoom());
    if (userZoom == 18) {
      defaultDistance = 0.4;
      console.log("def Dis", location, defaultDistance);
    }
    if (userZoom == 17) {
      defaultDistance = 0.5;
      console.log("def Dis", location, defaultDistance);
    }
    if (userZoom == 16) {
      defaultDistance = 0.7;
      console.log("def Dis", location, defaultDistance);
    }
    if (userZoom == 15) {
      defaultDistance = 0.9;
      console.log("def Dis", location, defaultDistance);
    }
    if (userZoom == 14) {
      defaultDistance = 1.1;
      console.log("def Dis", location, defaultDistance);
    }
    if (userZoom == 13) {
      defaultDistance = 1.3;
      console.log("def Dis", location, defaultDistance);
    }
    if (userZoom == 12) {
      defaultDistance = 1.5;
      console.log("def Dis", location, defaultDistance);
    }
    console.log("SOMETHING WEIRD HAPPENING");
    loadSpaetis(location, defaultDistance);
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
