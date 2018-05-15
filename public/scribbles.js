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

async function addCustomMarker(data) {
  console.log("DATATEST", data);
  var image = "./bierhand.png";

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
  console.log("CurrentMarketInfo", singleMarker);
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

    $(".name").html(singleMarker.Name);
    $(".spaetiAddress").html(singleMarker.Address);
    $(".distance").html(`${Math.round(singleMarker.Distance * 1000)} meter`);
    if (singleMarker.Opening.includes("unbekannt")) {
      $(".openingHours").html("not provided");
    } else {
      $(".openingHours").html(singleMarker.Opening);
    }

    var listOfItems = "";
    singleMarker.Offer.forEach(item => {
      listOfItems += `${item.Caption}, `;
    });
    $(".offer").html(listOfItems);
  });
  $("#closeTag").on("click touchstart", function() {
    $(".modal").css("display", "none");
    $(".modal-body").css("display", "none");
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

function loadSpaetis(location) {
  var curLatLongDis = getDistanceFromCurrentLocation(location);
  console.log(curLatLongDis);
  const reqSpaetis = $.ajax({
    url: "/results" + curLatLongDis,
    method: "GET",
    type: "application/json",
    success: function(dataList) {
      console.log("Results for spätis", typeof dataList, dataList);

      clearMap();

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

//MODAL
// (function() {
//
//   // Simple modal
// 	var modal = {
// 		init: function() {
//
// 			// Get the stuff
// 			this.clickToOpenModal();
//
// 			// Close the stuff
// 			this.closeModal();
//
// 		},
// 		clickToOpenModal: function(context, thisLink) {
//
// 			$('a[data-behaviour="modal"]').on('click', function(e) {
// 				var thisLink = $(this);
//
// 				var context = {
// 					title: thisLink.data('title'),
// 					content: thisLink.data('content')
// 				};
//
// 				e.preventDefault();
//
// 		     // Do nothing if open
// 		     if ( modal.outercontainer.children('div#modal').length ) return;
//
// 		     // Attach the content to the the modal
// 				modal.attachTemplate(context, thisLink);
//
// 				// Trigger the open event
// 				thisLink.trigger('open');
// 			});
//
// 		},
// 		attachTemplate: function(context, thisLink) {
// 			 var source = Handlebars.compile(this.source);
//
//         this.outercontainer
//           .append(source(context))
//           .promise()
//           .done(function() {
//
//           this
//             .children('div#modal')
//             .addClass('modal-visible');
//
//            // Close the stuff
//            thisLink.one('open', function() {
//              modal.closeModal();
//            });
//
//        });
// 		},
// 		closeModal: function() {
// 			var container = $("div#modal");
//
// 			// Remove modal on click background
// 			container.on('click', function() {
// 				container.remove();
//
// 			});
// 			// Remove modal on keypress ESC
// 			$(document).on( 'keydown', function (e) {
// 			    if ( e.keyCode === 27 ) {
// 			       container.remove();
// 			    }
// 			});
// 			// You can click on modal body
// 			container.find('div.modal-body').on('click', function(e) {
// 				e.stopPropagation();
// 			});
// 		}
// 	};
//
// 	modal.init();
//
// })();
