const { BOT_SECRET_TOKEN, NASA_API_KEY } = process.env
const Discord = require('discord.js')
const fetch = require('node-fetch')
const eventbus = require('./eventbus')
const client = new Discord.Client()
const Redis = require('ioredis-mock')
const redis = new Redis(6379)

function initBot() {
  client.login(BOT_SECRET_TOKEN)
  client.on('ready', () => {
    console.log('Connected as ' + client.user.tag)
    client.unsubscribe = eventbus.subscribe((msg) => {
      client.channels.forEach((channel) => {
        if (channel.type === 'text' && channel.name === 'general') {
          channel.send(msg)
          return
        }
      })
    })
  })
  client.on('error', (error) => {
    console.log('Horrible error', error)
  })
  client.on('message', async (msg) => {
    if (!msg.content.startsWith('!')) {
      return
    }
    const [cmdString, ...args] = msg.content.split(' ')
    const command = commandMap.get(cmdString)
    if (command) {
      const response = await command(msg, args)
      msg.reply(response)
    }
  })
  client.on('disconnect', () => {
    console.log('Disconnected ' + client.user.tag)
    client.unsubscribe()
  })
}

const commandMap = new Map([
  ['!ping', () => 'pong!'],
  ['!utbud', commandList],
  ['!apod', apod],
  ['!rulla', roll],
  ['!rullsnitt', rollAvg],
  ['!rulltot', rollTot],
  ['!korv', korv],
  ['!banan', banan],
  ['!kris', crisis],
  ['!corona', corona],
  ['!aktaHunden', aktaHunden],
])

async function apod() {
  const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`
  const response = await fetch(url)
  const json = await response.json()
  const mediaUrl = json.media_type === 'video' ? json.url : json.hdurl
  return mediaUrl + `\n${json.explanation}`
}

function commandList() {
  let output = []
  for (const key of commandMap.keys()) {
    output.push(key)
  }
  return `\n${output.join('\n')}`
}

async function corona(_, args) {
  const country = args.join(' ') || 'Sweden'
  const response = await fetch(
    'https://corona.lmao.ninja/v3/covid-19/countries',
  )
  const json = await response.json()
  const data = json.find(
    (x) => x.country.toLowerCase() === country.toLowerCase(),
  )
  if (!data) {
    return `Hittade inget data för ${country}`
  }
  return `
  COVID-19 data just nu **${country}**
  Fall: **${data.cases}**
  Nya fall idag: **${data.todayCases}**
  Dödsfall: **${data.deaths}**
  Dödsfall idag: **${data.todayDeaths}**
  Tillfrisknade: **${data.recovered}**
  Kritiskt tillstånd: **${data.critical}**`
}

function roll({ author }, args) {
  const rolls = [...Array(parseInt(args[0].split('d')[0] || 1)).keys()]
  const dice = args[0].split('d')[1].split('+')[0]
  const extra = parseInt(args[0].split('+')[1] || 0)
  const result = (max) =>
    Math.floor(Math.random() * (Math.floor(max) - 1 + 1) + 1)
  const sum = (acc, curr) => acc + curr

  const roll = async (dice, rolls, extra) => {
    const nat = rolls.map(() => result(dice))
    const total = nat.reduce(sum, extra)
    await redis.sadd(`rolls/${author.id}`, total)
    return `
${nat.length > 1 || extra > 0 ? nat.join(' + ') : ''}${
      extra > 0 ? ` *+ ${extra}*` : ''
    }${nat.length > 1 || extra > 0 ? '\n' : ''}**${total}**`
  }

  return roll(dice, rolls, extra)
}

async function rollAvg({ author }) {
  try {
    const rolls = await redis.smembers(`rolls/${author.id}`)
    const totalRollsValue = rolls.reduce((p, c) => p + parseInt(c, 10), 0)
    const avg = totalRollsValue / rolls.length
    return `du har rullat ${avg.toFixed(2).toString()} i snitt`
  } catch (error) {
    console.log(error)
    return 'kunde inte får främ din snitt :('
  }
}

async function rollTot({ author }) {
  try {
    const rolls = await redis.smembers(`rolls/${author.id}`)
    return `du har rullat ${rolls.length} gånger`
  } catch (error) {
    console.log(error)
    return 'kunde inte ta fram dina totalt antal rullningar :('
  }
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
    return 'de inge kris! :sweat_smile:'
  }

  return `
  >>> __***de kris***__

  ${entries.join('\n\n')}

  `
}

async function korv() {
  const response = await fetch('https://loremflickr.com/320/240/hotdog')
  return response.url
}

function banan() {
  return 'https://media-manager.starsinsider.com/1920/na_5bb4c827ef441.jpg'
}

async function aktaHunden() {
  const response = await fetch(
    'https://loremflickr.com/470/333/beware%20of%20dog',
  )
  if (Math.floor(Math.random() * (20 - 1 + 1) + 1) === 20) {
    return 'https://i.redd.it/0vw4wx5x9ng41.gif'
  } else {
    return response.url
  }
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

module.exports = initBot
