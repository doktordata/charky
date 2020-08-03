const CronJob = require('cron').CronJob
const eventbus = require('./eventbus')

function setupCronjobs() {
  const goodMorningCronJob = new CronJob('00 00 09 * * *', () => {
    const date = new Date()
    if (date.getDay() === 5) {
      eventbus.publish(
        'äntligen fredag charkuterister. carpe diem, trevlig helg.',
      )
      return
    }
    eventbus.publish('god morgon charkuterister')
  })
  const crisisCronJob = new CronJob('00 05 09 * * *', async () => {
    const msg = await crisis()
    eventbus.publish(msg)
  })
  goodMorningCronJob.start()
  crisisCronJob.start()
}

module.exports = setupCronjobs
