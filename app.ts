import { askQuery } from './src/controllers/chat.controller';

import express from 'express';
const app = express();
import routes from './src/routes/api';
import auth from "./src/routes/auth"
import { AppDataSource } from './src/config/data-source';
import { DataSource } from 'typeorm';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from './swagger';
import chat from './src/routes/chat'
import quiz from './src/routes/quiz'

import cors from "cors";


// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true })) // for form data
var corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

// Swagger setup
const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes setup
app.use('/api/auth', auth)
app.use('/api/chat', chat)
app.use('/api/quiz',quiz)



// Start server
const PORT = process.env.PORT || 3000

  AppDataSource.initialize()
  .then(async () => {
    console.log("Connection initialized with database...");
    app.listen(PORT, () => {
      console.log("Server is running on http://localhost:" + PORT);
    });
  })
  .catch((error) => console.log(error));

export const getDataSource = (delay = 3000): Promise<DataSource> => {
  if (AppDataSource.isInitialized) return Promise.resolve(AppDataSource);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (AppDataSource.isInitialized) resolve(AppDataSource);
      else reject("Failed to create connection with database");
    }, delay);
  });
};

export default app;
