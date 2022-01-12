const { users } = require("../../models");
const redisClient = require("../modules/redis");
const key = "users";

const joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  try {
    const { body } = req;

    const schema = joi.object({
      name: joi.string().min(3).required(),
      email: joi.string().email().min(9).required(),
      password: joi.string().min(8).required(),
      address: joi.string().min(5).required(),
    });

    const { error } = schema.validate(body);
    if (error) {
      return res.status(400).send({
        status: "failed",
        message: error.details[0].message,
      });
    }

    const { email, password } = body;
    const checkingEmail = await users.findOne({ where: { email: email } });
    if (checkingEmail) {
      return res.status(400).send({
        message: "email already registered",
      });
    }

    const hashStrength = 10;
    const hashedPassword = await bcrypt.hash(password, hashStrength);

    const dataUser = await users.create({
      ...body,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        id: dataUser.id,
      },
      process.env.SECRET_KEY
    );

    await redisClient.del(key, () => {
      console.log("sukses delete key");
    });

    res.status(200).send({
      message: "resource successfully create account",
      items: {
        data: dataUser,
        token,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Register Failed",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = req.body;

    const schema = joi.object({
      email: joi.string().email().min(9).required(),
      password: joi.string().min(8).required(),
    });

    const { error } = schema.validate(userData);

    if (error) {
      return res.status(400).send({
        status: "failed",
        message: error.details[0].message,
      });
    }

    const checkingEmail = await users.findOne({
      where: {
        email,
      },
    });

    if (!checkingEmail) {
      return res.status(400).send({
        status: "failed",
        message: "Email Or Password Don't Match",
      });
    }
    const isValidPassword = await bcrypt.compare(password, checkingEmail.password);

    if (!isValidPassword) {
      return res.status(400).send({
        status: "failed",
        message: "Email Or Password Don't Match",
      });
    }
    const token = jwt.sign(
      {
        id: checkingEmail.id,
      },
      process.env.SECRET_KEY
    );

    res.status(200).send({
      status: "success",
      message: "successfully login",
      items: {
        profile: checkingEmail,
        token,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      status: "Failed",
      message: "Server Error, Cannot Sign In",
    });
  }
};
