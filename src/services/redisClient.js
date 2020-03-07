const { REDIS_HOST, ENV } = process.env
const Redis = ENV === 'dev' ? require('ioredis-mock') : require('ioredis')
const redis = new Redis(6379, REDIS_HOST)

module.exports = redis
