const { connectToCollection } = require("../../DB/connectToCollection");
const bcrypt = require("bcrypt");

const login = async (req, res, next) => {
  const client = req.app.get("dbClient");
  const dbInstance = await connectToCollection(client, "note-pos", "users");
  try {
    const { username, password } = req.body;

    const searchCursor = await dbInstance.find({
      username,
    });

    const results = await searchCursor.toArray();

    const passwordCheck = await bcrypt.compare(password, results[0].password);
    if (!passwordCheck) throw `incorrect username/password given`;

    const { role, first_name } = results[0];

    res.status(200).send({
      username,
      role,
      first_name,
    });

    console.log(`user signed in:`, {
      username,
      role,
      first_name,
    });

    return {
      username,
      role,
      first_name,
    };
  } catch (err) {
    console.error(err.toString());
    res.status(500).send(err.toString());
    return err;
  }
};

module.exports = {
  login,
};
