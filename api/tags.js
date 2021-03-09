const express = require("express");
const tagsRouter = express.Router();
const { getAllTags, getPostsByTagName } = require("../db");
const postsRouter = require("./posts");
tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /tags");

  next();
});

tagsRouter.get("/", async (req, res) => {
  const tags = await getAllTags();

  res.send({
    tags,
  });
});

tagsRouter.get("/", async (req, res) => {
  const { tag } = req.params;
  console.log(tag);
  if (!tag) {
    next({ message: "no tag name" });
  }
  try {
    let posts = await getPostsByTagName(tag);
    posts = posts.filter(
      (post) => post.active || (req.user && post.author.id === req.user.id)
    );

    res.send({
      posts,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

tagsRouter.get("/:tagName/posts", async (req, res, next) => {
  const user = req.user;
  try {
    const allPosts = await getPostsByTagName(req.params.tagName);
    console.log(allPosts);
    const posts = allPosts.filter((post) => {
      if (post.active) {
        return true;
      }
      if (user && post.author.id === user.id) {
        return true;
      }
      return false;
    });

    res.send({ posts });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.delete("/:postId", async (req, res, next) => {
  try {
    const post = await getPostById(req.params.postId);

    if (post && post.author.id === req.user.id) {
      const updatedPost = await updatePost(post.id, { active: false });

      res.send({ post: updatedPost });
    } else {
      next(
        post
          ? {
              name: "UnauthorizedUserError",
              message: "You cannot delete a post which is not yours",
            }
          : {
              name: "PostNotFoundError",
              message: "That post does not exist",
            }
      );
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});
module.exports = tagsRouter;
