const { login } = require("../../../controllers/login/login");
const { MongoClient } = require("mongodb");
const { connectToCollection } = require("../../../DB/connectToCollection");

describe("Login", () => {
  let connection;

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const dbInstance = await connectToCollection(
      connection,
      "note-pos",
      "users"
    );

    await dbInstance.insertOne({
      username: "livmoore@example.com",
      password: "$2b$12$B8qkUOXcWq2ALb4FcRjy6.a47UyqZj9LnG8llcDSNhu8YyqbwIUme",
      first_name: "Liv",
      last_name: "Moore",
      role: "admin",
    });
  });

  afterAll(async () => {
    await connection.close();
  });

  const get = () => {
    return connection;
  };

  const req = {
    app: {
      get: get,
    },
    body: {
      username: "livmoore@example.com",
      password: "MAJOR_p3yt0n",
    },
  };

  const badReq = {
    app: {
      get: get,
    },
    body: {
      username: "NOTlivmoore@example.com",
      password: "MAJOR_p3asdfyt0n",
    },
  };

  const res = {
    send: jest.fn(),
    status: jest.fn(() => res),
  };

  it("should login user", async () => {
    const results = await login(req, res);
    await expect(results.first_name).toEqual("Liv");
  });

  it("should login user", async () => {
    const results = await login(badReq, res);
    await expect(results.toString()).toEqual("TypeError: Cannot read property 'password' of undefined");
  });

  it("should login user", async () => {
    req.body.password = "asdfasdf"  
    const results = await login(req, res);
    await expect(results).toEqual("incorrect username/password given");

    const dbInstance = await connectToCollection(
        connection,
        "note-pos",
        "users"
      );
  
      await dbInstance.drop();
  });
});
