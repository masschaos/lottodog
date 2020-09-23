const qs = require('querystring')
const request = require('request')
const baseUrl = process.env.BASE_URL || 'https://seaapi.lottowawa.com/staging/'
const VError = require('verror')

class LottoApi {
  /**
   * 获取国家区域配置
   */
  async getSystemConfigs() {
    return new Promise((resolve, reject) => {
      if (!baseUrl) {
        reject(new VError('请先设置 BASE_URL 环境变量'))
      }

      request.get(
        {
          uri: `${baseUrl}/system/config`,
          json: true,
        },
        (err, res, body) => {
          if (err) {
            return reject(new VError('获取国家区域配置失败: ' + err.message || err))
          }

          resolve(body)
        }
      )
    })
  }

  /**
   * 获取彩票信息列表
   */
  async getLotteries(country, level) {
    return new Promise((resolve, reject) => {
      if (!baseUrl) {
        reject(new VError('请先设置 BASE_URL 环境变量'))
      }

      const params = { country, level }
      request.get(
        {
          uri: `${baseUrl}/lotteries?${qs.stringify(params)}`,
          json: true,
        },
        (err, res, body) => {
          if (err) {
            return reject(new VError('获取彩票信息列表: ' + err))
          }

          resolve(body)
        }
      )
    })
  }

  /**
   * 获取全部彩票开奖结果
   */
  async getResults(country, level) {
    return new Promise((resolve, reject) => {
      if (!baseUrl) {
        reject(new VError('请先设置 BASE_URL 环境变量'))
      }

      const params = { country, level }
      request.get(
        {
          uri: `${baseUrl}/results?${qs.stringify(params)}`,
          json: true,
        },
        (err, res, body) => {
          if (err) {
            return reject(new VError('获取彩票信息列表: ' + err.message || err))
          }

          resolve(body)
        }
      )
    })
  }
}

module.exports = new LottoApi()
