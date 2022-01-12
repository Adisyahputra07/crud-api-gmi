const { users } = require("../../models");
const redisClient = require("../modules/redis");
const key = "users";

exports.getUsersList = async (req, res) => {
  const dataRedis = await redisClient.get(key);

  try {
    if (dataRedis !== null) {
      res.status(200).send({
        status: "success",
        masssage: "data redis",
        users: JSON.parse(dataRedis),
      });
    } else {
      const user = await users.findAll({
        attributes: {
          exclude: ["updatedAt", "createdAt"],
        },
      });
      res.status(200).send({
        status: "success",
        masssage: "data database",
        users: user,
      });

      await redisClient.set(key, JSON.stringify(user));
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.idUser;

    await users.update(req.body, {
      where: { id: userId },
    });

    const updatedData = await users.findOne({
      where: { id: userId },
    });

    await redisClient.del(key, () => {
      console.log("sukses delete users to redis");
    });

    res.status(200).send({
      status: "success",
      message: `Update data user success`,
      data: updatedData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = req.idUser;

    users.destroy({
      where: { id },
    });

    await redisClient.del(key, () => {
      console.log("sukses delete key");
    });

    res.status(200).send({
      status: "success",
      message: `Delete users Where id ${id} success`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};
