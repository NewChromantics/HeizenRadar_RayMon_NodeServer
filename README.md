# HeizenRadar_RayMon_NodeServer

## Uploading a File

Currently the app works by responding to a file being posted to the server using the path `/upload`

Using curl a wellformed request to the server looks like:

```
curl --location --request POST 'http://<IP>:<PORT>/upload' \
--form 'data=@/Users/user/<RayData>.txt'
```

If a file is not uploaded a 400 code will be sent back with the message 
`No files were uploaded.`

The form field must be 'data' otherwise the request will fail with
`Wrong key value for the file upload, Needs to be "data"`

_Malformed Request_
```
curl --location --request POST 'http://<IP>:<PORT>/upload' \
--form 'Data=@/Users/user/<RayData>.txt'
```

## Sending a File Location Using JSON

*Alternatively*

It is possible to send JSON in the body of the post which then loads the Ray Data from the specified file in this JSON

```
curl --location --request POST 'http:/<IP>:<PORT>/process' \
--header 'Content-Type: application/json' \
--data-raw '
  { \
    "FilePath": "/Users/user/<RayData>.txt" \
  }'
```

It is also possible to specify a .obj file using this method by specifying an `ObjPath`
```
curl --location --request POST 'http:/<IP>:<PORT>/process' \
--header 'Content-Type: application/json' \
--data-raw '
  { \
    "FilePath": "/Users/user/<RayData>.txt", \
    "ObjPath": "/Users/user/<Object>.obj" \
  }'
```

Using this same method you can also specify an output Filename and Location
for the zip data by specifying a `ZipOutputPath`
```
curl --location --request POST 'http:/<IP>:<PORT>/process' \
--header 'Content-Type: application/json' \
--data-raw ' \
  { \
    "FilePath": "/Users/user/<RayData>.txt", \
    "ObjPath": "/Users/user/<Object>.obj", \
    "ZipOutputPath": "/Users/user/<FileName>.zip" \
  }'
```

*NOTE* This file name must end with `.zip` and make sure to use absolute file paths

If a ZipOutputPath is not specified then a unique zipfile is made with `RayMonOutput_${GetTimeNowMs()}.zip`
and stored in the base folder of the app

---

There is also the option to either move or delete the temporary files produced during a run.

Neither of these options will affect the Zip file.

To *Move* add a `TempDirectory` variable to the json sent to the server
```
--data-raw ' \
  { \
    "FilePath": "/Users/user/<RayData>.txt", \
    "ObjPath": "/Users/user/<Object>.obj", \
    "ZipOutputPath": "/Users/user/<FileName>.zip", \
    "TempDirectory": "/Users/temp"  \
  }'
```

To *Delete* add a non empty `DeleteFiles` variable
```
--data-raw ' \
  { \
    "FilePath": "/Users/user/<RayData>.txt", \
    "ObjPath": "/Users/user/<Object>.obj", \
    "ZipOutputPath": "/Users/user/<FileName>.zip", \
    "DeleteFiles": "true"  \
  }'
```
