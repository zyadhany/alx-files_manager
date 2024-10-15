import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const email = req.body ? req.body.email : null;
    const password = req.body ? req.body.password : null;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const hpassword = sha1(password);

    const user = await (await dbClient.usersCollection()).findOne({ email });
    if (user) {
      res.status(400).json({ error: 'Already exist' });
      return
    }
    const insertionInfo = await (await dbClient.usersCollection())
      .insertOne({ email, password: hpassword });
    return res.status(201).json({ email, id: insertionInfo.insertedId });
  }
}

export default UsersController;
