const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { Sequelize, Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

class User extends Model {}
User.init({
  name: DataTypes.STRING,
  email: DataTypes.STRING,
}, { sequelize, modelName: 'user' });

sequelize.sync();

const init = () => {
  const app = express();
  dotenv.config();

  middleware(app);
  endpoints(app);

  app.listen(process.env.PORT, process.env.HOST, () => {
    console.log(`Listening at http://${process.env.HOST}:${process.env.PORT}`);
  });
};

const middleware = (app) => {
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.json());
  app.use(express.urlencoded({extended: false}));
};

const endpoints = (app) => {
  app.get('/', (req, res) => {
    res.render('index');
  });

  app.get('/users', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
  });

  app.get('/users/:id', async (req, res) => {
    const user = await User.findByPk(req.params.id);
    res.json(user);
  });

  app.post('/users', async (req, res) => {
    const user = await User.create(req.body);
    res.json(user);
  });

  app.put('/users/:id', async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.update(req.body);
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });

  app.delete('/users/:id', async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.destroy();
      res.json({ message: 'User deleted' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
};

init();