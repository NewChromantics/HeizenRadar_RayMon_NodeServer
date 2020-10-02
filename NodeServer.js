const express = require( 'express' )
const fileUpload = require( 'express-fileupload' );
const app = express()
const { spawn } = require( "child_process" );

const hostname = '127.0.0.1';
const port = 3000;

const PopExe = "./node_modules/@newchromantics/popengine/ubuntu-latest/PopEngineTestApp"
const RaymonBootPath = "./node_modules/@newchromantics/heizenradar_raymon/"
let RayDataFilename;
let SceneObjFilename;

// Middleware for JSON
//app.use( express.json() );

// Runs the Raymon app and sends back a zip of the data
function RunAndRespond( res )
{
	const Raymon = spawn( PopExe, [ RaymonBootPath, `RayDataFilename=${RayDataFilename}`, `ObjFilename=${SceneObjFilename}` ] );
	let log = "";
	let ZipFile = '';
	Raymon.stdout.on( "data", ( data ) =>
	{
		console.log( `stdout: ${data}` );
		log += data;
		let StringData = data.toString();

		if ( StringData.startsWith( "Zipname" ) )
		{
			var Regex = /\w+.zip/
			let RegexArray = Regex.exec( StringData );
			console.log( RegexArray[ 0 ] )
			ZipFile = RegexArray[ 0 ];
		}
		else if( StringData.includes( "match count(null"))
		{
			Raymon.stdout.pause();
			Raymon.kill();
			res.statusCode = 400;
			res.setHeader( 'Content-Type', 'text/plain' );
			res.end( `Malformed Data: \n${log}` );
		}
	} );

	Raymon.stderr.on( "stderr", ( stderr ) =>
	{
		log += stderr;
		res.statusCode = 500;
		res.setHeader( 'Content-Type', 'text/plain' );
		res.end( `stderr: \n${log}` );
	} );

	Raymon.on( 'error', ( error ) =>
	{
		console.log( `error: ${error.message}` );

		log += error.message;
		res.statusCode = 500;
		res.setHeader( 'Content-Type', 'text/plain' );
		res.end( `error: \n${log}` );
	} );

	Raymon.on( "close", ( code ) =>
	{
		const filePath = `./node_modules/@newchromantics/heizenradar_raymon/${ZipFile}`;

		res.download( filePath )

	} );
}

app.post( '/upload', async ( req, res ) =>
{
	if ( !req.files || Object.keys( req.files ).length === 0 )
	{
		return res.status( 400 ).send( 'No files were uploaded.' );
	}

	let RayData = req.files.data;

	// Move the data to the correct location
	try
	{
		RayData.mv( './node_modules/@newchromantics/heizenradar_raymon/Data.txt', ( err ) => 
		{
			if ( err )
				return res.status( 500 ).send( err );
		} );
	}
	catch ( err )
	{
		return res.status( 400 ).send( `Wrong key value for the file upload, Must be "data"`);
	}


	RunAndRespond( res )
} );

app.listen( 3000, () => console.log( `Server running at http://${hostname}:${port}/` ) );
