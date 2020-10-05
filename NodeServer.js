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

let log = "";

app.use(
	fileUpload( {
		useTempFiles: true,
		tempFileDir: os.tmpdir()
	} ),
	express.json(),
);

function ServerResponse(res, value) {
	switch(value)
	{
		case "error":
			res.statusCode = 500;
			res.setHeader( 'Content-Type', 'text/plain' );
			res.end( `ERROR LOG: \n${log}` );
			break;

		case "Malformed Data":
			res.statusCode = 400;
			res.setHeader( 'Content-Type', 'text/plain' );
			res.end( `Malformed Data: \n${log}` );
			break;
		case "success":
			// TODO: Test whether this causes a clashing header error
			/*
				_http_outgoing.js:491
					throw new Error('Can\'t set headers after they are sent.');
			*/
			res.statusCode = 200;
			res.end();
			break;
	};
}

// Runs the Raymon app and sends back a zip of the data
function RunAndRespond( res )
{
	const Raymon = spawn( PopExe, [ RaymonBootPath, `RayDataFilename=${RayDataFilename}`, `ObjFilename=${SceneObjFilename}` ] );
	log = "";
	let ZipFile = "";
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
			Raymon.kill();
			ServerResponse(res, 'Malformed Data')
		}
	} );

	Raymon.stderr.on( "stderr", ( stderr ) =>
	{
		log += stderr;

		ServerResponse(res, 'error')
	} );

	Raymon.on( 'error', ( error ) =>
	{
		console.log( `error: ${error.message}` );
		log += error.message;

		ServerResponse(res, 'error')
	} );

	Raymon.on( "close", ( code ) =>
	{
		const filePath = `${RaymonBootPath}${ZipFile}`;

		res.download( filePath )

		ServerResponse(res, "success");
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
		// remove this if to throw an error if an object is not uploaded
		if ( req.files.obj )
		{
			SceneObjFilename = req.files.obj.filePath;
		}
		else
		{
			SceneObjFilename = "Assets/Room3.obj";
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

app.post( '/process', async ( req, res ) =>
{
	if( typeof req.body !== 'object')
	{
		return res.status( 400 ).send( 'JSON Object not uploaded.' );
	}

	// Expecting a json object like: {FilePath: "FilePath"}
	// TODO Write a test for this;
	console.log(req.body.FilePath);
	RayDataFilename = req.body.FilePath;
	if ( req.body.ObjPath )
	{
		SceneObjFilename = req.body.ObjPath;
	}
	else
	{
		SceneObjFilename = "Assets/Room3.obj";
	}

	try
	{
		RunAndRespond( res )
	}
	catch ( error )
	{
		console.log( error );
	}

})

app.listen( 3000, () => console.log( `Server running at http://${hostname}:${port}/` ) );
