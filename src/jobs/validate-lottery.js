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
  env: '开发',
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
        const resultFile = path.join(__dirname, 'result', 'lottery', moment().format('YYYYMMDD/hhmm'), `${country}-${level}.json`)

        try {
          // get api data
          const lotteryList = await lottoApi.getLotteries(country.code, level.code)

          // validate data
          const result = apiDataValidator.validate('#/components/schemas/Lottery', lotteryList)
          saveResult && apiDataValidator.saveResult(result, resultFile)

          total += result.total || 0
          failedCount += result.failed || 0

          const count = result.result.length
          let n = messages.length
          let i = 0
          while (n < 10 && i < count) {
            messages.push(JSON.stringify(result.result[i]))
            i++
            n++
          }
        } catch (err) {
          saveResult && apiDataValidator.saveResult({ err }, resultFile)
          messages.push(`验证 ${country.name} ${level.name} 异常: ` + JSON.stringify(err))
        }
      }
    }

    // 发送 slack 消息
    im.error(`检查彩票信息列表记录共 ${total} 条，失败 ${failedCount} 条，\n${messages.join('\n')}`)
    console.log('DONE!')
  } catch (err) {
    console.error(err)
    messages.push('操作异常: ' + JSON.stringify(err))
  }
}

executeJob() // start execute job!
