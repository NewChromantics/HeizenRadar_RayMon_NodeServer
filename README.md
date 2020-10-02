# HeizenRadar_RayMon_NodeServer

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

--Malformed Request--
```
curl --location --request POST 'http://<IP>:<PORT>/upload' \
--form 'Data=@/Users/user/<RayData>.txt'
```

---

The app parses the file contents and will return a 400 code `Malformed Data: `
with a complete log of the app run attached.

---

A node version of posting a file
```
var request = require('request');
var fs = require('fs');
var options = {
  'method': 'POST',
  'url': 'http://<IP>:<PORT>/upload',
  'headers': {
  },
  formData: {
    'data': {
      'value': fs.createReadStream('/Users/user/<RayData>.txt'),
      'options': {
        'filename': '<RayData>.txt',
        'contentType': null
      }
    }
  }
};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});
```
