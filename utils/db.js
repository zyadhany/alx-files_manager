import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    this.client = new MongoClient(`mongodb://${host}:${port}/${database}`, { useUnifiedTopology: true });
    this.client.connect();
    this.db = this.client.db();
  }

  async usersCollection() {
    return this.client.db().collection('users');
  }

  async filesCollection() {
    return this.client.db().collection('files');
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return new Promise((resolve, reject) => {
      this.db.collection('users').find().count((err, count) => {
        if (err) reject(err);
        resolve(count);
      });
    });
  }

  async nbFiles() {
    return new Promise((resolve, reject) => {
      this.db.collection('files').find().count((err, count) => {
        if (err) reject(err);
        resolve(count);
      });
    });
  }
}

const dbClient = new DBClient();
export default dbClient;
