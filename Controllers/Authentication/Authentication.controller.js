import prisma from "../../client.js";
import bcrypt from "bcrypt";
import {
  doesExist,
  generateAccessToken,
  getUser,
  getUserById,
} from "../../Utils/Auth.utils.js";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 12;

const AuthenticationController = {
  login: async (req, res, next) => {
    const { username, password } = req.body;
    console.log("Login attempt:", { username });

    try {
      // Get User
      const user = await getUser(username);
      console.log("Fetched user from database:", user);

      // Check User
      if (user === null) {
        console.log("User not found or account inactive.");
        return res.status(401).send({
          status: 401,
          message:
              "اسم المستخدم أو كلمة المرور غير صالحة أو الحساب لم يتم تفعيله بعد!",
          data: {},
        });
      }

      // Check Password
      const passMatched = await bcrypt.compare(password, user.PasswordHash);
      console.log("Password match status:", passMatched);

      if (!passMatched) {
        console.log("Incorrect password for user:", username);
        return res.status(401).send({
          status: 401,
          message:
              "اسم المستخدم أو كلمة المرور غير صالحة أو الحساب لم يتم تفعيله بعد!",
          data: {},
        });
      }

      // Generate JWT
      const access_token = await generateAccessToken({
        id: user.Id,
        username: user.Username,
        role: user.Role,
      });
      console.log("Generated access token:", access_token);

      await prisma.users.update({
        where: { Id: user.Id },
        data: {
          LastLogin: new Date(),
          // HashedRefreshToken: hashedRefreshToken,
        },
      });
      console.log("Updated user's last login time:", user.Id);

      return res.status(200).send({
        status: 200,
        message: "تم تسجيل دخول المستخدم بنجاح!",
        data: {
          access_token: access_token,
          user: {
            id: user.Id,
            name: `${user.Firstname} ${user.Lastname}`,
            email: user.Email,
            userImage: user.PhotoPath,
            userRole: user.Role,
          },
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  checkSession: async (req, res) => {
    const Token = req.headers["authorization"];
    console.log("Checking session with token:", Token);

    try {
      if (!Token) {
        console.log("No token provided.");
        return res.status(401).send({
          status: 401,
          message: "لم يتم توفير رمز. الرجاء تسجيل الدخول!",
        });
      }

      const access_token = Token.split(" ")[1];
      console.log("Extracted access token:", access_token);

      const decodedAccess = jwt.verify(access_token, process.env.ACCESS_TOKEN);
      console.log("Decoded access token:", decodedAccess);

      const now = Math.floor(Date.now() / 1000);

      if (decodedAccess.exp < now) {
        console.log("Session expired.");
        return res.status(401).send({
          status: 401,
          message: "انتهت صلاحية الجلسة. الرجاء تسجيل الدخول!",
        });
      }

      const user = await getUser(decodedAccess.username);
      console.log("Fetched user for session check:", user);

      return res.status(200).send({
        user: {
          id: user.Id,
          name: `${user.Firstname} ${user.Lastname}`,
          email: user.Email,
          userImage: user.PhotoPath,
          userRole: user.Role,
        },
        status: 200,
        message: "الجلسة صالحة!",
      });
    } catch (error) {
      console.error("Session check error:", error);

      if (
          error instanceof jwt.JsonWebTokenError ||
          error instanceof jwt.NotBeforeError ||
          error instanceof jwt.TokenExpiredError
      ) {
        console.log("Invalid or expired token.");
        return res.status(401).send({
          status: 401,
          message: "جلسة غير صالحة أو منتهية. الرجاء تسجيل الدخول!",
        });
      }

      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
      });
    }
  },

  signOut: async (req, res) => {
    try {
      console.log("Signing out user...");

      // Clear the cookies
      res.clearCookie("Access_Token", {
        httpOnly: true,
        sameSite: "Lax",
        path: "/",
      });
      res.clearCookie("Refresh_Token", {
        httpOnly: true,
        sameSite: "Lax",
        path: "/",
      });

      console.log("User signed out successfully.");

      // Send a response indicating the user was signed out
      return res.status(200).send({
        status: 200,
        message: "تم تسجيل الخروج بنجاح!",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
      });
    }
  },

  createAdmin: async (req, res, next) => {
    const file = req.file;
    const { username, email, firstname, lastname, phoneNumber, password } =
        req.body;

    console.log("Creating admin with:", { username, email });

    try {
      // Check if user credentials already exist
      const doesExistUser = await doesExist({ username, email, phoneNumber });
      console.log("User existence check:", doesExistUser);

      if (doesExistUser != null) {
        console.log("User already exists.");
        return res.status(409).send({
          status: 409,
          message: doesExistUser,
          data: {},
        });
      }

      // Hash password for safe keeping
      const hashedPass = await bcrypt.hash(password, SALT_ROUNDS);
      console.log("Hashed password generated.");

      // Create new user
      await prisma.users.create({
        data: {
          Email: email,
          Firstname: firstname,
          Lastname: lastname,
          PasswordHash: hashedPass,
          Username: username,
          PhoneNumber: phoneNumber,
          Role: "FACTORYMANAGER",
          Category: "MANAGEMENT",
          IsActive: true,
          PhotoPath: `/${file.destination.split("/")[1]}/${file.filename}`,
        },
      });

      console.log("New admin created successfully.");

      // If success return success response
      return res.status(201).send({
        status: 201,
        message: "تم إنشاء مدير جديد بنجاح!",
        data: {},
      });
    } catch (error) {
      console.error("Create admin error:", error);

      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  createUser: async (req, res, next) => {
    const file = req.file;
    const userId = req.userId;
    const { userInfo } = req.body;
    const parsedUserInfo = JSON.parse(userInfo);

    const {
      username,
      email,
      firstname,
      lastname,
      phoneNumber,
      password,
      role,
      category,
    } = parsedUserInfo;

    console.log("Creating user with:", { username, email });

    try {
      // Check if user credentials already exist
      const doesExistUser = await doesExist({ username, email, phoneNumber });
      console.log("User existence check:", doesExistUser);

      if (doesExistUser != null) {
        console.log("User already exists.");
        return res.status(409).send({
          status: 409,
          message: doesExistUser,
          data: {},
        });
      }

      // Hash password for safe keeping
      const hashedPass = await bcrypt.hash(password, SALT_ROUNDS);
      console.log("Hashed password generated.");

      // Create new user
      await prisma.users.create({
        data: {
          Email: email,
          Firstname: firstname,
          Lastname: lastname,
          PasswordHash: hashedPass,
          Username: username,
          PhoneNumber: phoneNumber,
          Role: role,
          Category: category,
          IsActive: true,
          PhotoPath: file
              ? `/${file.destination.split("/")[1]}/${file.filename}`
              : "",
          Audit: {
            create: {
              CreatedById: userId,
              UpdatedById: userId,
              IsDeleted: false,
            },
          },
        },
      });

      console.log("New user created successfully.");

      // If success return success response
      return res.status(201).send({
        status: 201,
        message: "تم إنشاء مستخدم جديد بنجاح!",
        data: {},
      });
    } catch (error) {
      console.error("Create user error:", error);

      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  getManagers: async (req, res, next) => {
    console.log("Fetching managers...");
    try {
      const departments = await prisma.departments.findMany({
        select: {
          ManagerId: true,
        },
      });
      const warehouses = await prisma.warehouses.findMany({
        select: {
          ManagerId: true,
        },
      });
      const warehouseManagerIds = warehouses.map(
          (warehouse) => warehouse.ManagerId
      );
      const managerIds = departments.map((dept) => dept.ManagerId);

      const allIds = [...managerIds, ...warehouseManagerIds];

      const users = await prisma.users.findMany({
        where: {
          AND: [
            { Audit: { IsDeleted: false } },
            { Role: { not: "FACTORYMANAGER" } },
            {
              Id: { notIn: allIds },
            },
          ],
        },
        select: {
          Id: true,
          Firstname: true,
          Lastname: true,
          Role: true,
        },
      });

      console.log("Managers fetched successfully.");

      return res.status(200).send({
        status: 200,
        message: "تم جلب جميع المستخدمين بنجاح!",
        data: users,
      });
    } catch (error) {
      console.error("Get managers error:", error);

      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  getAllUsers: async (req, res, next) => {
    console.log("Fetching all users...");
    try {
      const users = await prisma.users.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Id: true,
          Firstname: true,
          Lastname: true,
          Username: true,
          Email: true,
          Role: true,
          PhoneNumber: true,
          Department: {
            select: {
              Name: true,
              CategoryName: true,
            },
          },
          Warehouse: {
            select: {
              WarehouseName: true,
              CategoryName: true,
            },
          },
          IsActive: true,
          PhotoPath: true,
        },
      });

      console.log("Users fetched successfully.");

      return res.status(200).send({
        status: 200,
        message: "تم جلب جميع المستخدمين بنجاح!",
        data: users,
      });
    } catch (error) {
      console.error("Get all users error:", error);

      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  toggleUser: async (req, res, next) => {
    const toggleUserId = parseInt(req.params.id);
    const userId = req.userId;
    console.log("Toggling user status for ID:", toggleUserId);

    try {
      const user = await getUserById(+toggleUserId);
      console.log("User to toggle:", user);

      if (!user) {
        console.log("User not found.");
        return res.status(404).send({
          status: 404,
          message: "User not found!",
          data: {},
        });
      }

      await prisma.users.update({
        where: {
          Id: +toggleUserId,
          Audit: { IsDeleted: false },
        },
        data: {
          IsActive: !user.IsActive,
          Audit: { update: { data: { UpdatedById: userId } } },
        },
      });

      console.log("User status toggled successfully.");

      return res.status(200).send({
        status: 200,
        message: "تم تبديل حالة المستخدم بنجاح!",
        data: {},
      });
    } catch (error) {
      console.error("Toggle user error:", error);

      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  deleteUser: async (req, res, next) => {
    const userId = parseInt(req.params.id);
    console.log("Deleting user with ID:", userId);

    try {
      await prisma.users.update({
        where: {
          Id: +userId,
        },
        data: {
          Audit: {
            update: {
              data: {
                IsDeleted: true,
                UpdatedById: userId,
              },
            },
          },
        },
      });

      console.log("User deleted successfully.");

      return res.status(200).send({
        status: 200,
        message: "تم حذف المستخدم بنجاح!",
      });
    } catch (error) {
      console.error("Delete user error:", error);

      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
      });
    }
  },

  updateUser: async (req, res, next) => {
    const userId =
        req.params.id !== "undefined" ? parseInt(req.params.id) : req.userId;
    const file = req.file;
    const { userInfo } = req.body;
    const parsedUserInfo = JSON.parse(userInfo);
    const {
      firstname,
      lastname,
      role,
      username,
      isActive,
      password,
      phoneNumber,
      email,
    } = parsedUserInfo;

    console.log("Updating user with ID:", userId);

    try {
      // Ensure the user exists
      const existingUser = await prisma.users.findUnique({
        where: {
          Id: userId,
        },
      });
      console.log("Existing user:", existingUser);

      if (!existingUser) {
        console.log("User not found.");
        return res.status(404).send({
          status: 404,
          message: "المستخدم غير موجود!",
        });
      }

      // Optional: Hash password if it's being updated
      let hashedPass = existingUser.PasswordHash;
      if (password.length > 0) {
        hashedPass = await bcrypt.hash(password, SALT_ROUNDS);
      }

      let updateData = {
        Firstname:
            firstname && firstname.length > 0
                ? firstname
                : existingUser.Firstname,
        Lastname:
            firstname && lastname.length > 0 ? lastname : existingUser.Lastname,
        PasswordHash: hashedPass,
        PhoneNumber: phoneNumber ? phoneNumber : existingUser.PhoneNumber,
        Email: email ? email : existingUser.Email,
        Role: role ? role : existingUser.Role,
        IsActive:
            isActive !== undefined ? JSON.parse(isActive) : existingUser.IsActive,
        PhotoPath: file
            ? `/${file.destination.split("/")[1]}/${file.filename}`
            : existingUser.PhotoPath,
      };

      if (username && username !== existingUser.Username) {
        updateData.Username = username;
      }

      console.log("Updating user with data:", updateData);

      await prisma.users.update({
        where: {
          Id: userId,
        },
        data: updateData,
      });

      console.log("User updated successfully.");

      return res.status(200).send({
        status: 200,
        message: "تم تحديث المستخدم بنجاح!",
      });
    } catch (error) {
      console.error("Update user error:", error);

      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
      });
    }
  },

  searchUsers: async (req, res) => {
    const searchTerm = req.params.searchTerm;
    console.log("Searching users with term:", searchTerm);

    try {
      if (!searchTerm) {
        console.log("No search term provided.");
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }

      const datas = await prisma.users.findMany({
        where: {
          OR: [
            {
              Firstname: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              Lastname: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              Department: {
                Name: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              Category: {
                equals: searchTerm,
              },
            },
          ],
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Id: true,
          Firstname: true,
          Lastname: true,
          Username: true,
          Email: true,
          Role: true,
          PhoneNumber: true,
          Department: {
            select: {
              Name: true,
              CategoryName: true,
            },
          },
          Warehouse: {
            select: {
              WarehouseName: true,
              CategoryName: true,
            },
          },
          IsActive: true,
          PhotoPath: true,
        },
      });

      console.log("Users found:", datas.length);

      return res.status(200).send({
        status: 200,
        message: "تم جلب المستخدمين بناءً على معايير البحث بنجاح.",
        data: datas,
      });
    } catch (error) {
      console.error("Search users error:", error);

      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
};

export default AuthenticationController;
