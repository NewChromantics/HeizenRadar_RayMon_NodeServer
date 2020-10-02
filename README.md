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

---

The app parses the file contents and will return a 400 code `Malformed Data: `
with a complete log of the app run attached.

## Sending a File Location Using JSON

*Alternatively*

It is possible to send JSON in the body of the post which then loads the Ray Data from the specified file in this JSON

```
curl --location --request POST 'http:/<IP>:<PORT>/process' \
--header 'Content-Type: application/json' \
--data-raw '{"FilePath": "/Users/user/<RayData>.txt"}'
```
