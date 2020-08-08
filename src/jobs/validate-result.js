const ApiDataValidator = require('../utils/api-data-validator')
const IM = require('@masschaos/im')
const lottoApi = require('../utils/lotto-api')
const moment = require('moment')
const path = require('path')
const saveResult = process.env.SAVE_RESULT

const im = new IM({
  provider: process.env.IM_PROVIDER || 'debug',
  token: process.env.IM_TOKEN,
  debugChannel: 'dev', // 频道名称
  infoChannel: 'dev',
  errorChannel: 'dev',
  source: 'lottodog',
  env: process.env.NODE_ENV || '开发',
})

const executeJob = async () => {
  const messages = []
  let total = 0
  let failedCount = 0

  try {
    const apiDataValidator = new ApiDataValidator(require('./schema/lotto-api'))
    const systemConfigs = await lottoApi.getSystemConfigs()

    for (const country of systemConfigs.countries) {
      for (const level of country.levels) {
        const resultFile = path.join(__dirname, 'result', 'result', moment().format('YYYYMMDD/hhmm'), `${country}-${level}.json`)

        try {
          // get api data
          const lotteryList = await lottoApi.getResults(country.code, level.code)

          // validate data
          const result = apiDataValidator.validate('#/components/schemas/Result', lotteryList)
          saveResult && apiDataValidator.saveResult(result, resultFile)

          total += result.total || 0
          failedCount += result.failed || 0

          const count = result.detail.length
          let n = messages.length
          let i = 0
          while (n < 10 && i < count) {
            messages.push(apiDataValidator.formatResult(country, level, result.detail[i]))
            i++
            n++
          }
        } catch (err) {
          saveResult && apiDataValidator.saveResult({ err }, resultFile)
          im.error(`检查彩票开奖结果记录 ${country.name} ${level.name} 异常: ` + JSON.stringify(err))
        }
      }
    }

    // 发送 slack 消息
    im.error(`检查彩票开奖结果记录共 ${total} 条，失败 ${failedCount} 条，\n${messages.join('\n')}`)
    console.log('DONE!')
  } catch (err) {
    console.error(err)
    im.error('检查彩票开奖结果记录异常: ' + JSON.stringify(err))
  }
}

executeJob() // start execute job!
