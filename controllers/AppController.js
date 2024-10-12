import redisClien from '../utils/redis.js';
import dbClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    res.status(200).send({ redis: redisClien.isAlive(), db: dbClient.isAlive() });
  }

  static async getStats(req, res) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();
    res.status(200).send({ users, files });
  }
}

export default AppController;
