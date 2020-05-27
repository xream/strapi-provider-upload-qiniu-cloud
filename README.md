# strapi-provider-upload-qiniu-cloud

**Example**

`./config/plugins.js`

change fields marked `// change`

```javascript
const qiniuKeyPrefix = '' // change
const qiniuPutPolicyAll = {
  bucket: '', // change
  keyPrefix: qiniuKeyPrefix,
  expires: 1 * 60 * 60,
  insertOnly: 1,
  isPrefixalScope: 0,
  detectMime: 1,
  fsizeLimit: 100 * 1024 * 1024,
  fsizeMin: 1,
  fileType: 0,
  forceSaveKey: true,
  // https://developer.qiniu.com/kodo/manual/1235/vars
  // eslint-disable-next-line no-template-curly-in-string, prefer-template
  saveKey: `${qiniuKeyPrefix}/\${year}\${mon}\${day}\${hour}\${min}\${sec}\${etag}_uid__magic_\${ext}`,
  returnBody: JSON.stringify({
    url: '_baseURL_/$(key)',
    mime: '$(mimeType)',
    ext: '$(ext)',
    name: '$(fprefix)',
    fsize: '$(fsize)',
    width: '$(imageInfo.width)',
    height: '$(imageInfo.height)',
  }),
}
module.exports = ({ env }) => ({
  upload: {
    provider: 'qiniu-cloud',
    providerOptions: {
      debug: true,
      delete: false,
      uploadTokenOpt: {},
      qiniu: {
        // https://developer.qiniu.com/kodo/manual/1671/region-endpoint
        zone: 'Zone_z0', // change
        uploadURL: 'https://upload.qiniup.com', // change
        mac: {
          accessKey: '', // change
          secretKey: '', // change
        },
        baseURL: '', // change
        // https://developer.qiniu.com/kodo/manual/1206/put-policy
        putPolicy: {
          all: qiniuPutPolicyAll,
          image: {
            ...qiniuPutPolicyAll,
            fsizeLimit: 5 * 1024 * 1024,
            mimeLimit: 'image/*',
          },
          video: {
            ...qiniuPutPolicyAll,
            fsizeLimit: 100 * 1024 * 1024,
            mimeLimit: 'video/*',
          },
          audio: {
            ...qiniuPutPolicyAll,
            fsizeLimit: 100 * 1024 * 1024,
            mimeLimit: 'audio/*',
          },
          json: {
            ...qiniuPutPolicyAll,
            fsizeLimit: 5 * 1024 * 1024,
            mimeLimit: 'application/json',
          },
        },
      },
    },
  },
})
```
