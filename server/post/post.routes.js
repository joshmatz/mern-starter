import Express from 'express';
import * as PostController from './post.controller';
const router = Express.Router(); // eslint-disable-line

// Get all Posts
router.route('/posts').get(PostController.getPosts);

// Get one post by title
router.route('/post/:slug').get(PostController.getPost);

// Add a new Post
router.route('/post').post(PostController.addPost);

// Delete a Post
router.route('/post/:id').delete(PostController.deletePost);

export default router;
