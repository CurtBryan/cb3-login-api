const { createLogin } = require("../../../controllers/login/createLogin");
const { MongoClient } = require("mongodb");
const { connectToCollection } = require("../../../DB/connectToCollection");

describe("Create Login", () => {
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
      firstName: "Liv",
      lastName: "Moore",
      role: "admin",
    },
  };

  const res = {
    send: jest.fn(),
    status: jest.fn(() => res),
  };

  it("should create login", async () => {
    const dbInstance = await connectToCollection(
      connection,
      "note-pos",
      "users"
    );

    await dbInstance.drop();
    const results = await createLogin(req, res);
    await expect(results).toEqual(req.body.firstName);
  });

  it("should be duplicate creation", async () => {
    const results = await createLogin(req, res);
    await expect(results).toEqual("username is already taken");
  });
});
