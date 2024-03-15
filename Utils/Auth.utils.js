import prisma from "../client.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const doesExist = async (credentials) => {
  try {
    let user = await prisma.users.findUnique({
      where: {
        Email: credentials?.email,
      },
    });

    if (user != null) {
      return "Email already exists!";
    }

    user = await prisma.users.findUnique({
      where: {
        Username: credentials?.username,
      },
    });

    if (user != null) {
      return "Username already exists!";
    }

    user = await prisma.users.findUnique({
      where: {
        PhoneNumber: credentials?.phoneNumber,
      },
    });

    if (user != null) {
      return "Phone number already exists!";
    }

    return null;
  } catch (error) {
    console.log(error);
  }
};

export const getUser = async (username) => {
  try {
    const user = await prisma.users.findUnique({
      select: {
        Id: true,
        Username: true,
        PasswordHash: true,
        Role: true,
        Firstname: true,
        Lastname: true,
        Email: true,
        PhotoPath: true,
      },
      where: { Username: username, IsActive: true },
    });

    return user;
  } catch (error) {}
};

export const generateAccessToken = async (user) => {
  try {
    const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
      expiresIn: "4h",
    });
    return token;
  } catch (error) {}
};

export const generateRefreshToken = async (user) => {
  try {
    const token = jwt.sign(user, process.env.REFRESH_TOKEN);
    return token;
  } catch (error) {}
};

export const verifyRefreshToken = async (userId, token) => {
  try {
    const user = await prisma.users.findUnique({ where: { Id: userId } });
    return await bcrypt.compare(token, user.HashedRefreshToken);
  } catch (error) {}
};

export const getUserById = async (userId) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        Id: userId,
        Audit: { IsDeleted: false },
      },
    });
    return user;
  } catch (error) {}
};
