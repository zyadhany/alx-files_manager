import redisClien from '../utils/redis.js';
import dbClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    res.status(200).send({ redis: redisClien.isAlive(), db: dbClient.isAlive() });
  }
}

export default AppController;
