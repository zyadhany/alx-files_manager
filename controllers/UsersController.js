import sh1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).send({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).send({ error: 'Missing password' });
    }

    const hpassword = sh1(password);

    const user = await (await dbClient.usersCollection()).findOne({ email });
    if (user) {
      return res.status(400).send({ error: 'Already exist' });
    }
    const insertionInfo = await (await dbClient.usersCollection())
      .insertOne({ email, password: hpassword });
    return res.status(201).json({ email, id: insertionInfo.insertedId });
  }
}

export default UsersController;
