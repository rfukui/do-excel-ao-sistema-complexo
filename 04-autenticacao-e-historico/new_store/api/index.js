import express from 'express'
import bodyParser from 'body-parser'
import authorRoutes from './server/routes/AuthorRoutes';
import userRoutes from './server/routes/UserRoutes';
const basicAuth = require('./server/services/basic-auth');
const errorHandler = require('./server/services/error-handler');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use('/api/users', userRoutes);

app.use(basicAuth)
app.use('/api/authors', authorRoutes);

// when a random route is inputed
app.get('*', (req, res) => res.status(200).send({
  message: 'Welcome to this API.',
}));

app.listen(port, () => {
  console.log(`Server is running on PORT ${port}`);
});

module.exports = app
