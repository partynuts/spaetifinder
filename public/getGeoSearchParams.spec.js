const mocha = require("mocha");
const { expect } = require("chai");
const getGeoSearchParams = require("./getGeoSearchParams");

describe("getGeoSearchParams", () => {
  it("returns valid search params for valid location and distance", done => {
    console.log(getGeoSearchParams);
    var loc = {
      lat: () => {
        return 34000;
      },
      lng: () => {
        return 13000;
      }
    };
    var dis = 0.7;
    var result = getGeoSearchParams(loc, dis);
    console.log("RESULT", result);
    expect(result).to.equal("?&lat=34000&long=13000&distance=0.7");
    done();
  });
});
