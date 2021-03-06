const _ = require('lodash')
const qiniu = require('qiniu')
const axios = require('axios')
const FormData = require('form-data')
const { nanoid } = require('nanoid')

class Qiniu {
  constructor(config) {
    this.config = config
  }

  getUploadTokenInfo({ type = 'all', magicKeys = [], expires } = {}) {
    const { config } = this
    if (!qiniu.zone[config.zone]) {
      throw new Error('Invalid Zone')
    }
    const mac = new qiniu.auth.digest.Mac(config.mac.accessKey, config.mac.secretKey)
    const putPolicyConfig = {
      ...config.putPolicy.all,
      ...config.putPolicy[type],
    }
    const { bucket, keyPrefix, isPrefixalScope } = putPolicyConfig
    putPolicyConfig.scope = isPrefixalScope ? `${bucket}:${keyPrefix}` : bucket
    if (process.env.NODE_ENV !== 'production' && expires) {
      putPolicyConfig.expires = Number(expires)
    }
    putPolicyConfig.saveKey = _.replace(putPolicyConfig.saveKey, /#/g, '$')
    putPolicyConfig.returnBody = _.replace(putPolicyConfig.returnBody, /#/g, '$')
    putPolicyConfig.saveKey = _.replace(
      putPolicyConfig.saveKey,
      '_magic_',
      _.isEmpty(magicKeys) ? '' : `\${${_.chain(magicKeys).join('}${').value()}}`
    )
    putPolicyConfig.returnBody = _.replace(putPolicyConfig.returnBody, '_baseURL_', config.baseURL)
    putPolicyConfig.saveKey = _.replace(putPolicyConfig.saveKey, '_uid_', nanoid())
    const putPolicy = new qiniu.rs.PutPolicy(putPolicyConfig)
    const { zone } = config
    const cnf = new qiniu.conf.Config()

    cnf.zone = qiniu.zone[zone]

    cnf.useHttpsDomain = true

    cnf.useCdnDomain = true
    return {
      uploadToken: putPolicy.uploadToken(mac),
      baseURL: config.baseURL,
      uploadURL: config.uploadURL,
      putPolicy: putPolicyConfig,
      mac,
      cnf,
    }
  }

  async getFormUploader({ uploadTokenOpt }) {
    const { uploadToken, cnf } = await this.getUploadTokenInfo(uploadTokenOpt)

    const formUploader = new qiniu.form_up.FormUploader(cnf)
    const putExtra = new qiniu.form_up.PutExtra()
    return {
      formUploader,
      putExtra,
      uploadToken,
    }
  }

  async getBucketManager({ uploadTokenOpt }) {
    const { mac, cnf, putPolicy, baseURL } = await this.getUploadTokenInfo(uploadTokenOpt)

    return {
      bucketManager: new qiniu.rs.BucketManager(mac, cnf),
      putPolicy,
      baseURL,
    }
  }

  async delete({ url, key, uploadTokenOpt }) {
    const {
      bucketManager,
      putPolicy: { bucket },
      baseURL,
    } = await this.getBucketManager({
      uploadTokenOpt,
    })

    return new Promise((resolve, reject) => {
      bucketManager.delete(bucket, key || _.replace(url, baseURL, ''), function (respErr, respBody, respInfo) {
        if (respErr) {
          reject(respErr)
        }
        resolve()
      })
    })
  }

  async putFile({ localFile, uploadTokenOpt }) {
    const { formUploader, putExtra, uploadToken } = await this.getFormUploader({
      uploadTokenOpt,
    })
    return new Promise((resolve, reject) => {
      formUploader.putFile(uploadToken, undefined, localFile, putExtra, function (respErr, respBody, respInfo) {
        if (respErr) {
          reject(respErr)
        }
        if (respInfo.statusCode === 200) {
          resolve(respBody)
        } else {
          reject(respErr)
        }
      })
    })
  }

  async putStream({ readableStream, uploadTokenOpt }) {
    const { formUploader, putExtra, uploadToken } = await this.getFormUploader({
      uploadTokenOpt,
    })
    return new Promise((resolve, reject) => {
      formUploader.putStream(uploadToken, undefined, readableStream, putExtra, function (respErr, respBody, respInfo) {
        if (respErr) {
          reject(respErr)
        }
        if (respInfo.statusCode === 200) {
          resolve(respBody)
        } else {
          reject(respErr)
        }
      })
    })
  }

  async put({ buffer, uploadTokenOpt }) {
    const { formUploader, putExtra, uploadToken } = await this.getFormUploader({
      uploadTokenOpt,
    })
    return new Promise((resolve, reject) => {
      formUploader.put(uploadToken, undefined, buffer, putExtra, function (respErr, respBody, respInfo) {
        if (respErr) {
          reject(respErr)
        }
        if (respInfo.statusCode === 200) {
          resolve(respBody)
        } else {
          reject(respErr)
        }
      })
    })
  }

  async formUploader({ buffer, uploadTokenOpt }) {
    const { uploadURL, uploadToken } = await this.getUploadTokenInfo(uploadTokenOpt)
    const form = new FormData()
    form.append('token', uploadToken)
    form.append('file', buffer)
    try {
      const instance = axios.create({
        validateStatus(status) {
          return true
        },
      })
      const { data } = await axios.post(uploadURL, form, {
        headers: form.getHeaders(),
      })
      return data
    } catch (e) {
      console.error(e)
    }
  }
}

module.exports = {
  Qiniu,
  init: (options = {}) => {
    const config = { ...options }

    const qiniu = new Qiniu(config.qiniu)
    const debug = strapi.logger ? true : config.debug
    return {
      async upload(file) {
        const logger = strapi.logger ? strapi.logger('file:qiniu:upload') : strapi.log
        if (debug) {
          logger.debug(_.omit(file, ['buffer']), 'file to upload')
          logger.debug(qiniu.getUploadTokenInfo(config.uploadTokenOpt), 'qiniu uploadTokenInfo')
        }
        const { buffer } = file

        const res = await qiniu.put({
          buffer,
          uploadTokenOpt: config.uploadTokenOpt,
        })

        if (debug) {
          logger.debug({ res }, 'file upload')
        }
        // eslint-disable-next-line no-param-reassign
        file.url = res.url
      },
      async delete(file) {
        const logger = strapi.logger ? strapi.logger('file:qiniu:delete') : strapi.log
        if (debug) {
          logger.debug({ delete: config.delete, file: _.omit(file, ['buffer']) }, 'file to delete')
        }
        if (!config.delete) return
        await qiniu.delete({
          url: file.url,
          uploadTokenOpt: config.uploadTokenOpt,
        })
      },
      qiniu,
    }
  },
}
