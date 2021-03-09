const express = require('express');
const postsRouter = express.Router();
const { getAllPosts, createPost, updatePost, getPostById } = require('../db');


const { requireUser } = require('./utils');

postsRouter.post('/', requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;

  const tagArr = tags.trim().split(/\s+/)
  const postData = {};
  const{user: {id, name, username}} =req;

  
  if (tagArr.length) {
    postData.tags = tagArr;
  }

  try { if (title && content){
    postData.authorId =id;
    postData.title =title;
    postData.content = content;
    const post =await createPost(postData);
  }
    
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.use((req, res, next) => {
  console.log("A request is being made to /posts");

  next();
});

postsRouter.get('/', async (req, res) => {
  try {
		const allPosts = await getAllPosts();
	
		const posts = allPosts.filter(post => post.active || (req.user && post.author.id === req.user.id));
	
		res.send({
		  posts
		});
	  } catch ({ name, message }) {
		next({ name, message });
	  }
  });
module.exports = postsRouter;