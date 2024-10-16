import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import { getUserFromAuth } from '../utils/auth';

class AuthController {
  static async getconnect(req, res) {
    const auth = req.header('Authorization') || null;
    if (!auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = await getUserFromAuth(req);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { email, password } = user;
    const userdb = await (await dbClient.usersCollection()).findOne({ email, password });
    if (!userdb) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = uuidv4();
    const key = `auth_${token}`;
    await redisClient.set(key, userdb._id, 86400);

    res.status(200).json({ token });
  }

  static async getdisconnect(req, res) {
    const token = req.header('X-Token') || null;
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    await redisClient.del(key);
    res.status(204).end();
  }
}

export default AuthController;
