const jwt = require("jsonwebtoken");

// Auth user
exports.auth = async (req, res, next) => {
  try {
    let header = req.header("Authorization");

    if (!header) {
      return res.status(400).send({
        message: "Access Failed",
      });
    }
    const token = header.replace("Bearer ", "");
    const secretKey = process.env.SECRET_KEY;
    const verifed = jwt.verify(token, secretKey, (error, decoded) => {
      if (error) {
        return res.status(400).send({
          message: "user not verified",
        });
      } else {
        return decoded;
      }
    });

    req.idUser = verifed.id;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server Error",
      location: "Middleware",
    });
  }
};
