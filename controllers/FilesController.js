import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { promises as fsPromises } from 'fs';
import UsersController from './UsersController';
import dbClient from '../utils/db';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

export default class FilesController {
  static async saveFile(parms) {
    const { name } = parms;
    let { parentId } = parms;
    const { userid } = parms;
    const { type } = parms;
    const { isPublic } = parms;
    const { data } = parms;

    if (parentId) parentId = ObjectId(parentId);

    const fileData = {
      userId: ObjectId(userid),
      name,
      type,
      parentId,
      isPublic,
    };

    if (type !== 'folder') {
      const filename = uuidv4();
      const filePath = `${FOLDER_PATH}/${filename}`;
      const decodedData = Buffer.from(data, 'base64');
      fileData.localPath = filePath;

      try {
        const re = await fsPromises.mkdir(FOLDER_PATH, { recursive: true });
        await fsPromises.writeFile(filePath, decodedData);
        console.log('data', re);
      } catch (err) {
        return { error: 'Cannot create the file', code: 400 };
      }
    }

    const insertionInfo = await (await dbClient.filesCollection()).insertOne(fileData);

    const file = {
      id: insertionInfo.insertedId,
      userId: userid,
      name,
      type,
      parentId: parentId || 0,
      isPublic,
    };

    return { error: null, code: 201, file };
  }

  static async postUpload(req, res) {
    const user = await UsersController.getuserFromAuth(req);

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name } = req.body;
    const { type } = req.body;
    const { isPublic } = req.body || false;
    const { data } = req.body;
    const { parentId } = req.body || null;

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

    const fileData = {
      userId: user._id,
      name,
      type,
      parentId: parentId || null,
      isPublic,
      data,
    };

    const { error, code, file } = await FilesController.saveFile(fileData);

    if (error) {
      res.status(code).json({ error });
      return;
    }

    res.status(201).json(file);
  }

  static async getfile(query) {
    return (await dbClient.filesCollection()).findOne(query);
  }
}
