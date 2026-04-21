const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AuthModel = require("../../models/AuthModel");
const AppError = require("../../errorHandlers/AppError");

class AuthenticationManager {

  // REGISTER
  static async registerUser({ name, email, password, bio, profile_pic }) {

    const userModel = new AuthModel();

    // normalize email
    email = email.toLowerCase();

    const existing = await userModel.findByEmail(email);

    if (existing) {
  throw new AppError("User already exists", 400, "User already exists");
}

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.createUser({
      name,
      email,
      password: hashedPassword,
      bio,
      profile_pic
    });

    // remove password if somehow returned
    delete user.password;

    return user;
  }

  // LOGIN
  static async loginUser({ email, password }) {

    const userModel = new AuthModel();

    email = email.toLowerCase();

    const user = await userModel.findByEmail(email);

    if (!user) {
    //   throw new Error("Invalid credentials");
    throw new AppError("User not found", 404, "User not found");
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
    //   throw new Error("Invalid credentials");
    throw new AppError("Invalid credentials", 400, "Invalid credentials");
    }

    // JWT
    const token = jwt.sign(
      {
        user_id: user.id
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profile_pic: user.profile_pic,
        credits: user.credits
      }
    };
  }

}

module.exports = AuthenticationManager;