const { MongoClient } = require("mongodb");
const {connectToCollection} = require("../../DB/connectToCollection")

describe("connectToCollection", () => {
  let connection;

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await connection.close();
  });

  const dbName = "note-pos"
  const collectionName = "items"

  it("should connect to collection", async () => {
    const results = await connectToCollection(connection, dbName, collectionName);
    await expect(results.s.namespace.collection).toEqual("items");
  });

  it("should fail to connect to collection - bad mongoInstance", async () => {
    const results = await connectToCollection({}, dbName, collectionName);
    await expect(results).toEqual("TypeError: dbInstance.db is not a function");
  });
});