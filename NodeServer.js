const http = require( 'http' );
const fileSystem = require('fs');
const path = require('path');
const { spawn } = require( "child_process" );

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer( ( req, res ) =>
{
	const Raymon = spawn("./node_modules/@newchromantics/popengine/ubuntu-latest/PopEngineTestApp", ["./"]);
	let log = "";
	Raymon.stdout.on( "data", ( data ) =>
	{
		// TODO: Add ERROR or DEBUG to the js throws and use that to parse them here...
		console.log( `stdout: ${data}` );
		log += data;
	} );

	Raymon.stderr.on( "stderr", ( stderr ) =>
	{
		log += stderr;
		res.statusCode = 500;
		res.setHeader( 'Content-Type', 'text/plain' );
		res.end( `error: ${log}` );
	} );

	Raymon.on( 'error', ( error ) =>
	{
		console.log( `error: ${error.message}` );

		log += error.message;
		res.statusCode = 500;
		res.setHeader( 'Content-Type', 'text/plain' );
		res.end( `error: ${log}` );
	} );

	Raymon.on( "close", ( code ) =>
	{
		res.statusCode = 200;
		res.setHeader( 'Content-Type', 'text/plain' );
		res.end( `result: ${log}` )

		/* TODO:: Parse the stdout for ZipFile: <Filename> */

		// let ZipFile = <Parsed Filename>

		// const filePath = path.join(__dirname, ZipFile);
		// const stat = fileSystem.statSync( filePath );

		// res.writeHead( 200, {
		// 	'Content-Type': 'application/zip',
		// 	'Content-Length': stat.size
		// } );

		// const readStream = fileSystem.createReadStream( filePath );
		// readStream.pipe( res );
		// res.end();
	} );

});

server.listen( port, hostname, () =>
{
	console.log( `Server running at http://${hostname}:${port}/` );
} );

// Can increase the server timeout like this if needed
// server.timeout = 20;