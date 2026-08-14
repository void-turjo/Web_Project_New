const express = require('express');
const router = express.Router();
const {
  getPosts,
  createPost,
  getPostComments,
  addComment,
  likePost,
  deletePost,
  editPost
} = require('../controllers/forumController');

router.get('/posts', getPosts);
router.post('/posts', createPost);
router.get('/comments/:postId', getPostComments);
router.post('/comments', addComment);
router.post('/like/:postId', likePost);
router.delete('/posts/:postId', deletePost);
router.put('/posts/:postId', editPost);

module.exports = router;
