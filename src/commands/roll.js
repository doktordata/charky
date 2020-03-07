const redisClient = require('../services/redisClient')

async function roll(msg) {
  const roll = Math.floor(Math.random() * (20 - 1 + 1) + 1)
  await redisClient.sadd(`rolls/${msg.author.id}`, roll)
  if (roll === 20) {
    msg.reply('https://i.imgur.com/vOwneFp.png')
  }

  if (roll === 1) {
    msg.reply('https://i.imgur.com/oPqbdoz.mp4')
  }

  msg.reply(roll)
}

module.exports = {
  name: '!rulla',
  description: 'Roll a d20',
  execute: roll,
}
