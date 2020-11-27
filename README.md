# HeizenRadar_RayMon_NodeServer

## Creating a Release

There are two occasions when you want to make a release and thus update and publish a new Docker Image.

### The Node Server

The first is when you update the code in this repository.

To make a new release first update and commit the version number in `package.json` ie ["version": "0.0.9"](https://github.com/NewChromantics/HeizenRadar_RayMon_NodeServer/blob/12af2c5ab0c73b975d3a8997c5df5996ba668df9/package.json#L6)

Next add a tag to that commit with the formatting of `v` followed by the version number ie `v0.0.9`

Once you push this tag to the repo the github workflow will trigger a build and release a new Docker Image with the tag of the version number of the tag pushed to trigger the workflow ie `v0.0.9` using the latest Ray Monitor package.

### Raymon Monitor Update

The second is when the base Raymon Package has been updated but updating the Node Server is not required.

To do this navigate to the `Actions` section of the repository and click on the [Create Image](https://github.com/NewChromantics/HeizenRadar_RayMon_NodeServer/actions?query=workflow%3A%22Create+Image%22) workflow.

Clicking the `Run Workflow` button on this page will will trigger a build and release a new Docker Image with the tag `latest` using the latest Ray Monitor package. 

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

Only the Zip File will be saved
