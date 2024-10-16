import { ObjectId } from 'mongodb';
import UsersController from './UsersController';
import dbClient from '../utils/db';

export default class FilesController {
  static async postUpload(req, res) {
    const user = await UsersController.getuserFromAuth(req);

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name } = req.body.name;
    const { type } = req.body.type;
    const { parentId } = req.body.parentId;
    const { isPublic } = req.body.isPublic || false;
    const { data } = req.body.data;

    if (!name) {
      res.status(400).json({ error: 'Missing name' });
      return;
    }

    if (!type || (type !== 'folder' && type !== 'file' && type !== 'image')) {
      res.status(400).json({ error: 'Missing type' });
      return;
    }

    if (!data && type !== 'folder') {
      res.status(400).json({ error: 'Missing data' });
      return;
    }

    if (parentId) {
      const parent = await FilesController.getfile({ _id: ObjectId(parentId) });
      const parentType = parent ? parent.type : null;
      if (!parent) {
        res.status(400).json({ error: 'Parent not found' });
        return;
      }
      if (parentType !== 'folder') {
        res.status(400).json({ error: 'Parent is not a folder' });
        return;
      }
    }

    const insertionInfo = await (await dbClient.filesCollection()).insertOne({
      userId: user._id,
      name,
      type,
      parentId: parentId || null,
      isPublic,
      data,
    });

    res.status(201).json({
      id: insertionInfo.insertedId,
      userId: user._id,
      name,
      type,
      parentId: parentId || null,
      isPublic,
    });
  }

  static async getfile(query) {
    return (await dbClient.filesCollection()).findOne(query);
  }
}
