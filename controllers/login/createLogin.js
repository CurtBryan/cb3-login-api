const {connectToCollection} = require("../../DB/connectToCollection")
const bcrypt = require("bcrypt")
const saltRounds = 12;

const createLogin = async (req, res, next) => {
  const client = req.app.get("dbClient");
  const dbInstance = await connectToCollection(client, "note-pos", "users");
  try {
    const { username, password, firstName, lastName, role } = req.body;

    const searchCursor = await dbInstance.find({
      username,
    });

    const results = await searchCursor.toArray();

    if (results.length > 0) throw `username is already taken`;

    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const insertStatement = {
      username,
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      role,
    };

    const insertCursor = await dbInstance.insertOne(insertStatement);

    res.send(insertCursor.ops[0].username)

    console.log("created login", insertCursor.ops[0].first_name)

    return insertCursor.ops[0].first_name
  } catch (err) {
    console.error(err);
    res.send(err.toString());
    return err.toString()
  }
};

module.exports = {
  createLogin,
};
