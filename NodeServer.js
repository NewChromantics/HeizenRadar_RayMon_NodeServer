const os = require( 'os' );
const path = require('path')
const express = require( 'express' );
const fileUpload = require( 'express-fileupload' );
const app = express()
const { spawn } = require( "child_process" );

const pjson = require('./package.json');
const port = 3000;
const TimeOutLimit = 5 * 60 * 1000; // 5 mins

const PopExe = "./node_modules/@newchromantics/popengine/ubuntu-latest/PopEngineTestApp"
const RaymonBootPath = "/test/"
let RayDataFilename;
let SceneObjFilename;
let ZipSaveLocation;
let RunId;
let ProcessIds = {};

let log = `Server Version: ${pjson.version}`;
log += `HeizenRadar Raymon Version: ${pjson.dependencies["@newchromantics/heizenradar_raymon"]}\n`;

// Send log on timeout
app.use( ( req, res, next ) =>
{
	res.setTimeout( TimeOutLimit, function ()
	{
		console.log( 'Request has timed out.' );
		ServerResponse( res, "timeout" )
	} );

	next();
} );

app.use('/upload', fileUpload(
	{
		useTempFiles: true,
		tempFileDir: os.tmpdir()
	}),
);

app.use( '/process', express.json() );

function ServerResponse(res, value) {
	switch(value)
	{
		case "error":
			res.statusCode = 500;
			res.setHeader( 'Content-Type', 'text/plain' );
			res.end( `ERROR LOG: \n${log}` );
			break;

		case "success":
			res.statusCode = 200;
			res.setHeader( 'Content-Type', 'text/plain' );
			res.end("Success");
			break;

		case "timeout":
			res.statusCode = 400;
			res.setHeader( 'Content-Type', 'text/plain' );
			res.end( `Request Timeout: \n${log}` );
			break;

		case "nodata":
			res.statusCode = 400;
			res.setHeader( 'Content-Type', 'text/plain' );
			res.end( `No data: \n${log}` );
			break;
	};
}

// Runs the Raymon app and sends back a zip of the data
function RunApp( res )
{
	// All executables are added as part of the final meta data file
	const Raymon = spawn( PopExe, [
		RaymonBootPath,
		`RayDataFilename=${RayDataFilename}`,
		`ObjFilename=${SceneObjFilename}`,
		`ZipSaveLocation=${ZipSaveLocation}`,
		`TimeOfRun=${Date()}`,
		`ServerVersion=${pjson.version}`,
		`SeverDependencies=${pjson.dependencies}`,
		`NodeVersion=${process.versions.node}`
	] );

	ProcessIds[RunId] = [];
	log = "";
	let ZipFile = "";
	var ProgressRegex = /^([0-9]+\.?[0-9]*)% <(.*)>/;

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

	} );

	Raymon.stderr.on( 'data', ( data ) =>
	{
		console.log( `stderr: ${data}` );
		log += data;

		let StringData = data.toString();

		if ( StringData.startsWith( "Zipname" ) )
		{
			console.log(StringData)
			var Regex = /\w+.zip/
			let RegexArray = Regex.exec( StringData );
			console.log( RegexArray[ 0 ] )
			ZipFile = RegexArray[ 0 ];
		}

		if ( StringData.startsWith( "ProgressReport:" ))
		{
			StringData = StringData.slice(StringData.indexOf(":") + 1)
			let RegexResult = ProgressRegex.exec( StringData );
			console.log(StringData)
			console.log( RegexResult );
			ProcessIds[RunId] = [RegexResult[ 1 ], RegexResult[ 2 ]];
			console.log(ProcessIds[RunId]);
		}
	} );

	Raymon.on( 'error', ( error ) =>
	{
		console.log( `error: ${error.message}` );
		log += error.message;

		ServerResponse(res, 'error')
	} );

	Raymon.on( "close", ( code ) =>
	{
		console.log("Finished")

		res.download( ZipSaveLocation, e =>
			{
				if(e)
				{
					console.log(e);
					ServerResponse(res, 'error')
				}
			})

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
		RunApp( res )
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

	RayDataFilename = req.body.FilePath;
	ZipSaveLocation = path.resolve(req.body.ZipOutputPath);
	RunId = req.body.id;

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
		RunApp( res )
	}
	catch ( error )
	{
		console.log( error );
	}

})
app.get( '/progress/:processId', async ( req, res ) =>
{
	res.send(ProcessIds[req.params.processId]);
})

app.listen( port, () => console.log( `Server running port: ${port}/` ) );
