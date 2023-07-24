// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const uuid = require('uuid');
const { check, validationResult } = require('express-validator');
const { Comment } = require('./models');
const { DATABASE_URL, PORT } = require('./config');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

// GET requests to /posts
app.get('/posts/:postId/comments', (req, res) => {
  Comment
    .findAll({
      where: {
        postId: req.params.postId
      }
    })
    .then(comments => res.json(comments.map(comment => comment.apiRepr())))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    });
});

// POST requests to /posts
app.post('/posts/:postId/comments', [
  check('name', 'Name must not be empty').not().isEmpty(),
  check('content', 'Content must not be empty').not().isEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  Comment
    .create({
      id: uuid.v4(),
      name: req.body.name,
      content: req.body.content,
      postId: req.params.postId
    })
    .then(comment => res.status(201).json(comment.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    });
});

// PUT requests to /posts
app.put('/posts/:postId/comments/:id', [
  check('name', 'Name must not be empty').not().isEmpty(),
  check('content', 'Content must not be empty').not().isEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  Comment
    .findById(req.params.id)
    .then(comment => {
      if (comment.postId !== req.params.postId) {
        const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match