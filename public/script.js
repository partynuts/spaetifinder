var latlng;
var myLatLng = {};

function initMap() {
  latlng = new google.maps.LatLng(52.520007, 13.404954);
  var myOptions = {
    zoom: 16,
    center: latlng
    // mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById("map"), myOptions);

  var marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    title: "Hello World!"
  });
}

function newPosition() {
  var latlng = new google.maps.LatLng(52.520007, 13.404954);
  var myOptions = {
    zoom: 16,
    center: latlng
    // mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById("map"), myOptions);
}

function loadSpaetis(lat, lng, distance) {
  $.ajax({
    url:
      "http://m.spätifinder.de/apiv2/?apitoken=bcdbf9379f9eb3a7436a94a55934d2b6ef78d6f9&action=list&lat=52.520007&long=13.404954&distance=0.7", //hier müssen die Koordinaten geändert werden um die Spätis zu der adresse anzuzeigen
    method: "GET",
    type: "application/json",
    data: {
      name
      // limit: 20
    },
    success: function(data) {
      console.log("Results for spätis", data);
      // newPosition();
      // data.forEach(spaeti => {
      //   myLatLng.push({spaeti})
      for (let i = 0; i < data.length; i++) {
        let lat = parseFloat(data[i].Lat);
        let long = parseFloat(data[i].Long);
        myLatLng = { lat, long };
        // var myLatLng.push({lat, long});
      }
      console.log("spaeti coord", myLatLng);
      // })
      let marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        title: "Hello World!"
      });
      console.log("marker", marker);
      marker.setMap(map);
    },
    error: function() {
      alert("boom");
    }
  });

  // [AJAX GET späti finder URL 1 ?lat/lng/distance]
  // onsuccess => showSpaetisOnMap()
  // onError => alert('Sorry :/');
}

loadSpaetis();

// function showSpaetisOnMap (spaetis, lat, lng) {
//
//     map.addPoint(p) (see: https://developers.google.com/maps/documentation/javascript/markers?hl=de)
// }
