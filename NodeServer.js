const os = require( 'os' );
const express = require( 'express' );
const fileUpload = require( 'express-fileupload' );
const app = express()
const { spawn } = require( "child_process" );

const hostname = '127.0.0.1';
const port = 3000;

const PopExe = "./node_modules/@newchromantics/popengine/ubuntu-latest/PopEngineTestApp"
const RaymonBootPath = "./node_modules/@newchromantics/heizenradar_raymon/"
let RayDataFilename;
let SceneObjFilename;

app.use(
	fileUpload( {
		useTempFiles: true,
		tempFileDir: os.tmpdir()
	} ),
	express.json(),
);

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
			throw 'Malformed Data'
		}
	} );

	Raymon.stderr.on( "stderr", ( stderr ) =>
	{
		log += stderr;
		throw 'stderr'
	} );

	Raymon.on( 'error', ( error ) =>
	{
		console.log( `error: ${error.message}` );

		log += error.message;
		throw 'error'
	} );

	Raymon.on( "close", ( code ) =>
	{
		const filePath = `${RaymonBootPath}${ZipFile}`;

		res.download( filePath )

		// TODO: Need to call res.end here but this block is also called when the process is killed on Malformed Data
		// causing a clashing header error
		/*
			_http_outgoing.js:491
				throw new Error('Can\'t set headers after they are sent.');
		*/
	} );
}

app.post( '/upload', async ( req, res ) =>
{
	if ( !req.files || Object.keys( req.files ).length === 0 )
	{
		return res.status( 400 ).send( 'No files were uploaded.' );
	}

	try
	{
		RayDataFilename = req.files.data.tempFilePath;
		// remove this if to force throw an error
		if ( req.files.obj )
		{
			SceneObjFilename = req.files.obj.filePath;
		}
		else
		{
			SceneObjFilename = RaymonBootPath + "Assets/Room3.obj";
		}
	}
	catch ( error )
	{
		return res.status( 400 ).send( `Wrong key value for the file upload, Must be "data"` );
	}

	try
	{
		RunAndRespond( res )
	}
	catch ( error )
	{
		console.log( error );
	}
} );

app.listen( 3000, () => console.log( `Server running at http://${hostname}:${port}/` ) );
