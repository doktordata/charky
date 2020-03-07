const redisClient = require('../services/redisClient')

async function rollTot(msg) {
  try {
    const rolls = await redisClient.smembers(`rolls/${msg.author.id}`)
    msg.reply(`du har rullat ${rolls.length} gånger`)
  } catch (error) {
    console.log(error)
    msg.reply('kunde inte ta fram dina totalt antal rullningar :(')
  }
}

module.exports = {
  name: '!rulltot',
  description: 'Authors total number of dice rolls',
  execute: rollTot,
}
