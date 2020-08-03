require('dotenv').config()
const setupCronJobs = require('./src/cronJobs')
const initBot = require('./src/bot')

function main() {
  setupCronJobs()
  initBot()
}

main()
