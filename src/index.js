const CronJob = require('cron').CronJob
const validateLotteryJob = require('./jobs/validate-lottery')
const validateResultJob = require('./jobs/validate-result')
const isDebug = String(process.env.DEBUG_MODE) === 'true'

const cronjobLottery = new CronJob(
  isDebug ? '*/3 * * * *' : '0 */1 * * *', // 每个整点检查一次
  function () {
    validateLotteryJob.executeJob()
  }
)

const cronjobResult = new CronJob(
  isDebug ? '*/3 * * * *' : '*/30 * * * *', // 每半小时检查一次,
  function () {
    validateResultJob.executeJob()
  }
)

// now start jobs
cronjobLottery.start()
cronjobResult.start()
