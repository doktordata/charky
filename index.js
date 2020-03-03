require('dotenv').config()
const Discord = require('discord.js')
const fetch = require('node-fetch')
const CronJob = require('cron').CronJob
const client = new Discord.Client()
const { BOT_SECRET_TOKEN, NASA_API_KEY } = process.env

client.login(BOT_SECRET_TOKEN)

client.on('ready', () => {
  console.log('Connected as ' + client.user.tag)
  setupCronjobs(client.channels)
})

function broadcaster(msg) {
  this.forEach(channel => {
    if (channel.type !== 'text') {
      return
    }
    channel.send(msg)
  })
}
const broadcast = broadcaster.bind(client.channels)

const commandMap = {
  '!ping': () => 'pong!',
  '!utbud': commandList,
  '!apod': apod,
  '!rulla': roll,
  '!korv': () => 'https://loremflickr.com/320/240/hotdog',
  '!kris': crisis,
}

client.on('message', async msg => {
  const command = commandMap[msg]
  if (command) {
    const response = await command()
    msg.reply(response)
  }
})

async function apod() {
  const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`
  const response = await fetch(url)
  const json = await response.json()
  const mediaUrl = json.media_type === 'video' ? json.url : json.hdurl
  return mediaUrl + `\n${json.explanation}`
}

function commandList() {
  return `\n${Object.keys(commandMap).join('\n')}`
}

function roll() {
  const roll = Math.floor(Math.random() * (20 - 1 + 1) + 1)

  if (roll === 20) {
    return 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fs-media-cache-ak0.pinimg.com%2F736x%2Ffa%2F3a%2F08%2Ffa3a08031e524a4c6efa131c91078b6f.jpg&f=1&nofb=1'
  }

  if (roll === 1) {
    return 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fih1.redbubble.net%2Fimage.280065502.4484%2Fflat%2C800x800%2C075%2Cf.jpg&f=1&nofb=1'
  }

  return roll
}

function setupCronjobs() {
  const goodMorningCronJob = new CronJob('00 00 09 * * *', () => {
    broadcast('god morgon charkuterister')
  })
  const crisisCronJob = new CronJob('00 05 09 * * *', async () => {
    const msg = await crisis()
    broadcast(msg)
  })
  goodMorningCronJob.start()
  crisisCronJob.start()
}

async function crisis() {
  const response = await fetch(
    'http://api.krisinformation.se/v1/feed?format=json',
  )
  const json = await response.json()
  const { Entries } = json
  const utcNow = Date.now()
  const entries = Entries.reduce((p, c) => {
    const utcDate = dateToUtc(new Date(c.Published))
    if (utcNow - 1000 * 60 * 60 * 24 > utcDate) {
      return p
    }
    const output = `${new Date(c.Published).toLocaleDateString()} - **${
      c.Title
    }**
    *${c.Summary}*`
    return [...p, output]
  }, [])

  if (entries.length < 1) {
    return 'Vill bara säga att det inte är någon kris! :sweat_smile:'
  }

  return `
  >>> __***Krisinformation senaste 24h***__

  ${entries.join('\n\n')}

  `
}

function dateToUtc(date) {
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  )
}
