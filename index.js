const express = require( "express" );
const http = require( "http" );
const app = express();
let Token;
if ( process.env.Token ) {
	Token = process.env.Token;
} else {
	Token = require( "./secrets.json" ).Token;
}
console.log( "TOKEN", Token );

const request = require( "request" );
const hb = require( "express-handlebars" );

app.engine( "handlebars", hb() );

app.set( "view engine", "handlebars" ); //diese beiden Zeilen bleiben immer gleich für wenn man Handlebars benutzt

app.use( express.static( __dirname + "/public" ) );

app.use( ( req, res, next ) => {

	if ( process.env.NODE_ENV == 'production' && !req.headers[ 'x-forwarded-proto' ].startsWith( 'https' ) ) {

		return res.redirect( `https://${req.hostname}${req.url}` );

	} else {
		next();
	}
} )


app.get( "/", function( req, res, next ) {
	res.redirect( "/spaetifinder" );
} );

app.get( "/spaetifinder", function( req, res ) {
	res.render( "spaetifinder", {
		title: "Spaetifinder"
	} );
} );

app.get( "/addspaeti", function( req, res ) {
	res.render( "addspaeti", {
		title: "Spaetifinder"
	} );
} );

app.get( "/results", function( req, res ) {
	var qs = {
		action: "list",
		apitoken: Token,
		lat: req.query.lat,
		long: req.query.long,
		distance: req.query.distance
	};
	var request = require( "request" );
	request( {
			uri: "http://m.spätifinder.de/apiv2",
			qs
		},
		function( error, response, body ) {
			res.json( JSON.parse( body ) );
		}
	);
} );

app.get( "/list", ( req, res, next ) => {
	console.log( "REQ QUERY", req.query );
	var qs = {
		action: "list",
		apitoken: Token,
		lat: req.query.lat,
		long: req.query.long,
		distance: req.query.distance
	};
	if ( !req.query.lat ) {
		return null;
	}
	var request = require( "request" );
	request( {
			uri: "http://m.spätifinder.de/apiv2",
			qs
		},
		( error, response, body ) => {
			// console.log("BODYYYYYYYYYYYYYYYY", JSON.parse(body));
			var spaetis = JSON.parse( body );
			console.log( spaetis[ 1 ] );
			// for (var i = 0; i < spaetis.length; i++) {
			// }

			res.json( spaetis );
		}
	);
} );

app.listen( process.env.PORT || 8080, () => {
	console.log( `SPAETIFINDER!!!!!!!!!` );
} );