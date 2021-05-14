const connectToCollection = async (dbInstance, dbName, collectionName) => {
  try {
    const db = await dbInstance.db(dbName);
    const collection = await db.collection(collectionName);
    console.log(
      `connected to ${db.databaseName}.${collection.s.namespace.collection}`
    );
    return collection;
  } catch (err) {
    console.error(err);
    return err.toString();
  }
};

module.exports = {
  connectToCollection,
};
