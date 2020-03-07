const redisClient = require('../services/redisClient')

async function rollAvg(msg) {
  try {
    const rolls = await redisClient.smembers(`rolls/${msg.author.id}`)
    const totalRollsValue = rolls.reduce((p, c) => p + parseInt(c, 10), 0)
    const avg = totalRollsValue / rolls.length
    msg.reply(`du har rullat ${avg.toFixed(2).toString()} i snitt`)
  } catch (error) {
    console.log(error)
    msg.reply('kunde inte får främ din snitt :(')
  }
}

module.exports = {
  name: '!rullsnitt',
  description: 'Authors average dice rolls',
  execute: rollAvg,
}
