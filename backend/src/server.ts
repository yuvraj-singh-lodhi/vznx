// src/server.ts
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import projectsRoutes from './routes/projects';
import tasksRoutes from './routes/tasks';
import teamRoutes from './routes/team';

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => res.send('Hello, World!'));

// API
app.use('/api/projects', projectsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/team', teamRoutes);

export default app;
