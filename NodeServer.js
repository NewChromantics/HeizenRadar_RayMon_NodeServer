const path = require('path');
const { spawn } = require( "child_process" );

const hostname = '127.0.0.1';
const port = 3000;

const express = require('express')
const app = express()

app.get('/', (req, res) => {

	const Raymon = spawn("./node_modules/@newchromantics/popengine/ubuntu-latest/PopEngineTestApp", ["./node_modules/@newchromantics/heizenradar_raymon/"]);
	let log = "";
	let ZipFile = '';
	Raymon.stdout.on( "data", ( data ) =>
	{
		// TODO: Add ERROR or DEBUG to the js throws and use that to parse them here...
		console.log( `stdout: ${data}` );
		log += data;

		// if(data.startsWith("Zipname"))
		// 	ZipFile = data.substring(11); // "Zipname: " = 11 characters
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
		console.log("close")
		// res.statusCode = 200;
		// res.setHeader( 'Content-Type', 'text/plain' );
		// res.end( `result: ${log}` )

		const filePath = path.join(__dirname, "/node_modules/@newchromantics/heizenradar_raymon/", "RayMonOutput_3907835971.zip");

		res.download(filePath);

	} );
	
})
app.listen(3000, () => console.log( `Server running at http://${hostname}:${port}/` ));

// Can increase the server timeout like this if needed
// server.timeout = 20;