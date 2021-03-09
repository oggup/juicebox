const express = require("express");
const tagsRouter = express.Router();
const { getAllTags, getPostsByTagName } = require("../db");
const { usersRouter } = require("./users");
tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

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
module.exports = tagsRouter;
