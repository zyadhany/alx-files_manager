import express from 'express';
// will understand it soon 
import router from './routes/index';

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use('/', router);

app.listen(PORT, () => {
  console.log(`Server running http://localhost:${PORT}`);
});

export default app;
