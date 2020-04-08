
const _ = require('lodash')
const qiniu = require('qiniu')

const zones = []
_.each(qiniu.zone, (v, k) => {
  if (_.isObjectLike(v)) {
    zones.push(k)
  }
})

module.exports = {
  provider: 'qiniu',
  name: 'Qiniu',
  auth: {
    qiniu_access_key: {
      label: 'access key',
      type: 'text',
    },
    qiniu_secret_key: {
      label: 'secret key',
      type: 'text',
    },
    qiniu_zone: {
      label: 'Region',
      type: 'enum',
      values: zones,
    },
    qiniu_bucket: {
      label: 'Bucket',
      type: 'text',
    },
    qiniu_key_prefix: {
      label: 'Prefix key',
      type: 'text',
    },
    qiniu_base_url: {
      label: 'Base URL(https?)',
      type: 'text',
    },
    qiniu_ext_suffix: {
      label: 'file ext as suffix',
      type: 'enum',
      values: ['Yes', 'No'],
    },
    qiniu_debug: {
      label: 'debug',
      type: 'enum',
      values: ['off', 'on'],
    },
  },
  init: conf => {
    const mac = new qiniu.auth.digest.Mac(conf.qiniu_access_key, conf.qiniu_secret_key)
    const config = new qiniu.conf.Config()
    config.zone = qiniu.zone[conf.qiniu_zone]
    config.useHttpsDomain = true
    config.useCdnDomain = true
    const formUploader = new qiniu.form_up.FormUploader(config)
    const bucket = conf.qiniu_bucket
    const prefix = conf.qiniu_key_prefix

    return {
      upload: file => new Promise((resolve, reject) => {
        let key = `${prefix}/${file.hash}`
        if (conf.qiniu_ext_suffix && conf.qiniu_ext_suffix === 'Yes') {
          key = `${key}${file.ext}`
        }
        const putPolicy = new qiniu.rs.PutPolicy({ scope: `${bucket}:${key}` })
        const uploadToken = putPolicy.uploadToken(mac)
        const putExtra = new qiniu.form_up.PutExtra()
        formUploader.put(uploadToken, key, file.buffer, putExtra, (e, body, info) => {
          if (conf.qiniu_debug === 'on') {
            strapi.log.debug('qiniu-upload', 'put', JSON.stringify({ key, e, body, info }, null, 2))
          }
          if (e) {
            strapi.log.error('qiniu-upload', e)
            // eslint-disable-next-line prefer-promise-reject-errors
            return reject({ ...e, isBoom: true })
          }

          if (info.statusCode === 200) {
            file.url = `${conf.qiniu_base_url}/${key}`
            return resolve()
          }
          return reject(e)
        })
      }),
      delete: file => {
        let key = `${prefix}/${file.hash}`
        if (conf.qiniu_ext_suffix && conf.qiniu_ext_suffix === 'Yes') {
          key = `${key}${file.ext}`
        }
        return new Promise((resolve, reject) => {
          const bucketManager = new qiniu.rs.BucketManager(mac, conf)
          bucketManager.delete(bucket, key, (err, respBody, respInfo) => {
            if (conf.qiniu_debug === 'on') {
              strapi.log.debug('qiniu-upload', 'delete', JSON.stringify({ bucket, key, err, respBody, respInfo }, null, 2))
            }
            let e = err
            const error = _.get(respBody, 'error')
            if (error) {
              e = error
            }
            if (e) {
              strapi.log.error('qiniu-upload', `Failed to delete file ${key}`)
              return reject(e)
            }
            resolve()
          })
        })
      },
    }
  },
}
