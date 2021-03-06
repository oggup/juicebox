const {
  client,
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
  createPost,
  updatePost,
  getAllPosts,
  getPostsByUser,
  getPostById,
  getPostsByTagName,
  addTagsToPost,
  createTags,
  getAllTags,
  getUserByUsername,
} = require("./index");

async function createInitialUser() {
  try {
    console.log("starting to create users...");

    const albert = await createUser({
      username: "albert",
      password: "bertie99",
      name: "Alberto",
      location: "Moscow",
    });
    const sandra = await createUser({
      username: "sandra",
      password: "sandra123",
      name: "Sandi",
      location: "Bikini Bottom",
    });
    const glamgal = await createUser({
      username: "glamagal",
      password: "galmi123",
      name: "Gertrude",
      location: "Ciudad Juarez",
    });
    console.log(albert);
    console.log(sandra);
    console.log(glamgal);
    console.log("Finished creating users!");
  } catch (error) {
    console.error("error creating users");
    throw error;
  }
}
async function createInitialPosts() {
  try {
    const [albert, sandra, glamgal] = await getAllUsers();
    console.log("Starting to create posts...");
    await createPost({
      authorId: albert.id,
      title: "First Post",
      content: "Here lies Albert.",
      tags: ["#happy", "#youcandoanything"],
    });
    await createPost({
      authorId: sandra.id,
      title: "How does this work?",
      content: "Seriously, it works! It can do anything?",
      tags: ["happy", "#best-day-ever", "#sad"],
    });
    await createPost({
      authorId: glamgal.id,
      title: "Living the Glam Life",
      content: "Do you even? I swear that half of you are posing.",
      tags: ["#happy", "#youcandoanything", "#canmandoanything"],
    });
    console.log("Finished creating posts!");
  } catch (error) {
    console.log("Error creating posts!");
    throw error;
  }
}

async function dropTables() {
  try {
    console.log("Starting to drop tables...");
    await client.query(`
        DROP TABLE IF EXISTS post_tags;
        DROP TABLE IF EXISTS tags;
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
        `);
    console.log("Finished dropping tables!!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
}

async function createTables() {
  try {
    console.log("Starting to build tables...");
    await client.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            active BOOLEAN DEFAULT true
            );
            CREATE TABLE posts (
              id SERIAL PRIMARY KEY,
              "authorId" INTEGER REFERENCES users(id),
              title VARCHAR(255) NOT NULL,
              content TEXT NOT NULL,
              active BOOLEAN DEFAULT true
              );
              CREATE TABLE tags (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL
            );
            CREATE TABLE post_tags (
              "postId" INTEGER REFERENCES posts(id),
              "tagId" INTEGER REFERENCES tags(id),
              UNIQUE ("postId", "tagId")
           );  
        `);
    console.log("Finished creating tables!!");
  } catch (error) {
    console.error("Error build tables!");
    throw error;
  }
}
async function testDB() {
  try {
    console.log("Starting to test database...");

    console.log("Calling getAllUsers");
    const users = await getAllUsers();
    console.log("Result:", users);

    console.log("Calling updateUser on users[0]");
    const updateUserResult = await updateUser(users[0].id, {
      name: "Newname Sogood",
      location: "Lesterville, KY",
    });
    console.log("Result:", updateUserResult);

    console.log("Calling getAllPosts");
    const posts = await getAllPosts();
    console.log("Result:", posts);

    console.log("Calling updatePost on posts[0]");
    const updatePostResult = await updatePost(posts[0].id, {
      title: "New Title",
      content: "Updated Content",
    });
    console.log("Result:", updatePostResult);

    console.log("Calling getUserById with 1");
    const albert = await getUserById(1);
    console.log("Result:", albert);

    console.log("Finished database tests!");
  } catch (error) {
    console.log("Error during testDB");
    throw error;
  }
}

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUser();
    await createInitialPosts();
  } catch (error) {
    throw error;
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
