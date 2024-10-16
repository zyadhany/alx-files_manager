/* eslint-disable import/no-named-as-default */
import mongoDBCore from 'mongodb/lib/core';
import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class UsersController {
  static async postNew(req, res) {
    const email = req.body ? req.body.email : null;
    const password = req.body ? req.body.password : null;

    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }
    const user = await (await dbClient.usersCollection()).findOne({ email });

    if (user) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }
    const insertionInfo = await (await dbClient.usersCollection())
      .insertOne({ email, password: sha1(password) });
    const userId = insertionInfo.insertedId.toString();

    res.status(201).json({ email, id: userId });
  }

  static async getMe(req, res) {
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
    const user = await (await dbClient.usersCollection()).findOne({
      _id: new mongoDBCore.BSON.ObjectId(userId),
    });

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    res.status(200).json({ email: user.email, id: userId });
  }
}
