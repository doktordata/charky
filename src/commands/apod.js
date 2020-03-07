const fetch = require('node-fetch')
const { NASA_API_KEY } = process.env

async function apod(msg) {
  try {
    if (!NASA_API_KEY) {
      throw new Error('NO NASA API KEY SUPPLIED')
    }
    const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`
    const response = await fetch(url)
    const json = await response.json()
    const mediaUrl = json.media_type === 'video' ? json.url : json.hdurl
    msg.channel.send(mediaUrl + `\n${json.explanation}`)
  } catch (error) {
    console.log(error)
    msg.reply('Det gick inte att hämta dagens rymdbild nu :(')
  }
}

module.exports = {
  name: '!apod',
  description: 'NASA astronomical picture of the day',
  execute: apod,
}
