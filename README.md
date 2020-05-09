# strapi-provider-upload-qiniu-cloud

**Example**

`./extensions/upload/config/settings.json`

change fields marked `// change`

```json
{
  "provider": "qiniu-cloud",
  "providerOptions": {
    "debug": true, // change
    "delete": true, // change
    "uploadTokenOpt": {},
    "qiniu": {
      "zone": "Zone_z0", // change
      "uploadURL": "https://upload.qiniup.com",
      "mac": {
        "accessKey": "accessKey", // change
        "secretKey": "secretKey" // change
      },
      "baseURL": "baseURL", // change
      "putPolicy": {
        "all": {
          "bucket": "bucket", // change
          "keyPrefix": "keyPrefix", // change
          "expires": 3600,
          "insertOnly": 1,
          "isPrefixalScope": 0,
          "detectMime": 1,
          "fsizeLimit": 104857600,
          "fsizeMin": 1,
          "fileType": 0,
          "forceSaveKey": true,
          "saveKey": "keyPrefix/#{year}#{mon}#{day}#{hour}#{min}#{sec}#{etag}_uid__magic_#{ext}",
          "returnBody": "{\"url\":\"_baseURL_/#(key)\",\"mime\":\"#(mimeType)\",\"ext\":\"#(ext)\",\"fsize\":\"#(fsize)\",\"width\":\"#(imageInfo.width)\",\"height\":\"#(imageInfo.height)\",\"name\":\"#(fprefix)\"}"
        },
        "image": {
          "bucket": "bucket",
          "keyPrefix": "keyPrefix",
          "expires": 3600,
          "insertOnly": 1,
          "isPrefixalScope": 0,
          "detectMime": 1,
          "fsizeLimit": 5242880,
          "fsizeMin": 1,
          "fileType": 0,
          "forceSaveKey": true,
          "saveKey": "keyPrefix/#{year}#{mon}#{day}#{hour}#{min}#{sec}#{etag}_uid__magic_#{ext}",
          "returnBody": "{\"url\":\"_baseURL_/#(key)\",\"mime\":\"#(mimeType)\",\"ext\":\"#(ext)\",\"fsize\":\"#(fsize)\",\"width\":\"#(imageInfo.width)\",\"height\":\"#(imageInfo.height)\",\"name\":\"#(fprefix)\"}",
          "mimeLimit": "image/*",
          "_client": true
        },
        "video": {
          "bucket": "bucket",
          "keyPrefix": "keyPrefix",
          "expires": 3600,
          "insertOnly": 1,
          "isPrefixalScope": 0,
          "detectMime": 1,
          "fsizeLimit": 104857600,
          "fsizeMin": 1,
          "fileType": 0,
          "forceSaveKey": true,
          "saveKey": "keyPrefix/#{year}#{mon}#{day}#{hour}#{min}#{sec}#{etag}_uid__magic_#{ext}",
          "returnBody": "{\"url\":\"_baseURL_/#(key)\",\"mime\":\"#(mimeType)\",\"ext\":\"#(ext)\",\"fsize\":\"#(fsize)\",\"width\":\"#(imageInfo.width)\",\"height\":\"#(imageInfo.height)\",\"name\":\"#(fprefix)\"}",
          "mimeLimit": "video/*",
          "_client": true
        },
        "audio": {
          "bucket": "bucket",
          "keyPrefix": "keyPrefix",
          "expires": 3600,
          "insertOnly": 1,
          "isPrefixalScope": 0,
          "detectMime": 1,
          "fsizeLimit": 104857600,
          "fsizeMin": 1,
          "fileType": 0,
          "forceSaveKey": true,
          "saveKey": "keyPrefix/#{year}#{mon}#{day}#{hour}#{min}#{sec}#{etag}_uid__magic_#{ext}",
          "returnBody": "{\"url\":\"_baseURL_/#(key)\",\"mime\":\"#(mimeType)\",\"ext\":\"#(ext)\",\"fsize\":\"#(fsize)\",\"width\":\"#(imageInfo.width)\",\"height\":\"#(imageInfo.height)\",\"name\":\"#(fprefix)\"}",
          "mimeLimit": "audio/*",
          "_client": true
        },
        "json": {
          "bucket": "bucket",
          "keyPrefix": "keyPrefix",
          "expires": 3600,
          "insertOnly": 1,
          "isPrefixalScope": 0,
          "detectMime": 1,
          "fsizeLimit": 5242880,
          "fsizeMin": 1,
          "fileType": 0,
          "forceSaveKey": true,
          "saveKey": "keyPrefix/#{year}#{mon}#{day}#{hour}#{min}#{sec}#{etag}_uid__magic_#{ext}",
          "returnBody": "{\"url\":\"_baseURL_/#(key)\",\"mime\":\"#(mimeType)\",\"ext\":\"#(ext)\",\"fsize\":\"#(fsize)\",\"width\":\"#(imageInfo.width)\",\"height\":\"#(imageInfo.height)\",\"name\":\"#(fprefix)\"}",
          "mimeLimit": "application/json"
        }
      }
    }
  }
}
```
