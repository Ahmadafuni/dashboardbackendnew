import prisma from "../../client.js";
import bcrypt from "bcrypt";
import {
  doesExist,
  generateAccessToken,
  getUser,
  getUserById,
} from "../../Utils/Auth.utils.js";
import jwt from "jsonwebtoken";

function ensureJPGExtension(filename) {
  if (filename.toLowerCase().endsWith(".jpeg")) {
    return filename.slice(0, -5) + ".jpg";
  }
  return filename;
}

const SALT_ROUNDS = 12;
// const ACCESS_EXPIRES = 60 * 60 * 4;

const AuthenticationController = {
  login: async (req, res, next) => {
    const { username, password } = req.body;
    // const expiryDate = new Date(Date.now() + ACCESS_EXPIRES);
    try {
      // Get User
      const user = await getUser(username);

      // Check User
      if (user === null) {
        return res.status(401).send({
          status: 401,
          message:
            "اسم المستخدم أو كلمة المرور غير صالحة أو الحساب لم يتم تفعيله بعد!",
          data: {},
        });
      }

      // Check Password
      const passMatched = await bcrypt.compare(password, user.PasswordHash);
      if (!passMatched) {
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
        role: user.Department.Category,
      });

      await prisma.users.update({
        where: { Id: user.Id },
        data: {
          LastLogin: new Date(),
        },
      });

      return res.status(200).send({
        status: 200,
        message: "تم تسجيل دخول المستخدم بنجاح!",
        data: {
          access_token: access_token,
          // refreshToken: refreshToken,
          user: {
            id: user.Id,
            name: `${user.Firstname} ${user.Lastname}`,
            email: user.Email,
            userImage: user.PhotoPath,
            userRole: user.Department.Category,
          },
        },
      });
    } catch (error) {
      console.log("THE ERROR", error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  checkSession: async (req, res) => {
    const Token = req.headers["authorization"];
    try {
      if (!Token) {
        return res.status(401).send({
          status: 401,
          message: "لم يتم توفير رمز. الرجاء تسجيل الدخول!",
        });
      }

      const access_token = Token.split(" ")[1];

      const decodedAccess = jwt.verify(access_token, process.env.ACCESS_TOKEN);
      const now = Math.floor(Date.now() / 1000);

      if (decodedAccess.exp < now) {
        return res.status(401).send({
          status: 401,
          message: "انتهت صلاحية الجلسة. الرجاء تسجيل الدخول!",
        });
      }
      const user = await getUser(decodedAccess.username);
      return res.status(200).send({
        user: {
          id: user.Id,
          name: `${user.Firstname} ${user.Lastname}`,
          email: user.Email,
          userImage: user.PhotoPath,
          userRole: user.Department.Category,
        },
        status: 200,
        message: "الجلسة صالحة!",
      });
    } catch (error) {
      if (
        error instanceof jwt.JsonWebTokenError ||
        error instanceof jwt.NotBeforeError ||
        error instanceof jwt.TokenExpiredError
      ) {
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
    const {
      username,
      email,
      firstname,
      lastname,
      phoneNumber,
      password,
      department,
    } = req.body;
    try {
      // Check user cred already exist
      const doesExistUser = await doesExist({ username, email, phoneNumber });
      if (doesExistUser != null) {
        return res.status(409).send({
          status: 409,
          message: doesExistUser,
          data: {},
        });
      }

      // Hash password for safe keeping
      const hashedPass = await bcrypt.hash(password, SALT_ROUNDS);
      // Create new user
      await prisma.users.create({
        data: {
          Email: email,
          Firstname: firstname,
          Lastname: lastname,
          PasswordHash: hashedPass,
          Username: username,
          PhoneNumber: phoneNumber,
          IsActive: true,
          DepartmentId: department,
          PhotoPath: `/${file.destination.split("/")[1]}/${file.filename}`,
          Audit: {
            create: {
              CreatedAt: new Date(),
            },
          },
        },
      });

      // If success return success response
      return res.status(201).send({
        status: 201,
        message: "تم إنشاء مدير جديد بنجاح!",
        data: {},
      });
    } catch (error) {
      console.log("the error", error);
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
      department,
    } = parsedUserInfo;
    try {
      // Check user cred already exist
      const doesExistUser = await doesExist({ username, email, phoneNumber });
      if (doesExistUser != null) {
        return res.status(409).send({
          status: 409,
          message: doesExistUser,
          data: {},
        });
      }

      // Hash password for safe keeping
      const hashedPass = await bcrypt.hash(password, SALT_ROUNDS);

      // Create new user
      await prisma.users.create({
        data: {
          Email: email,
          Firstname: firstname,
          Lastname: lastname,
          PasswordHash: hashedPass,
          Username: username,
          PhoneNumber: phoneNumber,
          DepartmentId: department,
          PhotoPath: file
            ? `/${file.destination.split("/")[1]}/${file.filename}`
            : "",
          Audit: {
            create: {
              CreatedById: userId,
              UpdatedById: userId,
            },
          },
        },
      });

      // If success return success response
      return res.status(201).send({
        status: 201,
        message: "تم إنشاء مستخدم جديد بنجاح!",
        data: {},
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  // getManagers: async (req, res, next) => {
  //   try {
  //     const departments = await prisma.departments.findMany({
  //       select: {
  //         ManagerId: true,
  //       },
  //     });
  //     const warehouses = await prisma.warehouses.findMany({
  //       select: {
  //         ManagerId: true,
  //       },
  //     });
  //     const warehouseManagerIds = warehouses.map(
  //       (warehouse) => warehouse.ManagerId
  //     );
  //     const managerIds = departments.map((dept) => dept.ManagerId);

  //     const allIds = [...managerIds, ...warehouseManagerIds];

  //     // This query retrieves a list of users based on the following conditions:
  //     // 1. The user has not been marked as deleted (IsDeleted is false).
  //     // 2. The user's role is not "FACTORYMANAGER".
  //     // 3. The user is not a manager of any department, determined by their Id not being in the list of managerIds.
  //     // The result includes the Id, Firstname, and Lastname of users who meet all these criteria.
  //     const users = await prisma.users.findMany({
  //       where: {
  //         AND: [
  //           { Audit: { IsDeleted: false } },
  //           { Role: { not: "FACTORYMANAGER" } },
  //           {
  //             Id: { notIn: allIds },
  //           },
  //         ],
  //       },
  //       select: {
  //         Id: true,
  //         Firstname: true,
  //         Lastname: true,
  //         Role: true,
  //       },
  //     });

  //     return res.status(200).send({
  //       status: 200,
  //       message: "تم جلب جميع المستخدمين بنجاح!",
  //       data: users,
  //     });
  //   } catch (error) {
  //     return res.status(500).send({
  //       status: 500,
  //       message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
  //       data: {},
  //     });
  //   }
  // },
  getAllUsers: async (req, res, next) => {
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
          PhoneNumber: true,
          Department: {
            select: {
              Id: true,
              Name: true,
              Category: true,
            },
          },
          IsActive: true,
          PhotoPath: true,
        },
      });

      return res.status(200).send({
        status: 200,
        message: "تم جلب جميع المستخدمين بنجاح!",
        data: users,
      });
    } catch (error) {
      console.log("THE ERROR", error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getUserById: async (req, res, next) => {
    const id = req.params.id;
    try {
      const user = await prisma.users.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Firstname: true,
          Lastname: true,
          Username: true,
          Email: true,
          PhoneNumber: true,
          Department: {
            select: {
              Id: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).send({
          status: 404,
          message: "User not found!",
          data: {},
        });
      }
      const formatedUser = {
        username: user.Username,
        password: "",
        email: user.Email,
        firstname: user.Firstname,
        lastname: user.Lastname,
        phoneNumber: user.PhoneNumber,
        department: user.Department.Id.toString(),
      };

      return res.status(200).send({
        status: 200,
        message: "User found!",
        data: formatedUser,
      });
    } catch (error) {
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
    try {
      const user = await getUserById(+toggleUserId);
      if (!user) {
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

      return res.status(200).send({
        status: 200,
        message: "تم تبديل حالة المستخدم بنجاح!",
        data: {},
      });
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  deleteUser: async (req, res, next) => {
    const userId = req.userId;
    const id = req.params.id;
    try {
      await prisma.users.update({
        where: {
          Id: +id,
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

      return res.status(200).send({
        status: 200,
        message: "تم حذف المستخدم بنجاح!",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
      });
    }
  },
  updateUser: async (req, res, next) => {
    const userId = req.userId;
    const file = req.file;
    const id = req.params.id;

    const { userInfo } = req.body;
    const parsedUserInfo = JSON.parse(userInfo);
    const {
      firstname,
      lastname,
      username,
      password,
      phoneNumber,
      email,
      department,
    } = parsedUserInfo;
    try {
      // Ensure the user exists
      const existingUser = await prisma.users.findUnique({
        where: {
          Id: +id,
        },
      });

      if (!existingUser) {
        return res.status(404).send({
          status: 404,
          message: "المستخدم غير موجود!",
        });
      }

      // Optional: Validate updates here
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
        DepartmentId: department > 0 ? department : existingUser.DepartmentId,
        PhotoPath: file
          ? `/${file.destination.split("/")[1]}/${file.filename}`
          : existingUser.PhotoPath,
      };

      // Only add Username to updateData if it's different and provided
      if (username && username !== existingUser.Username) {
        updateData.Username = username;
      }

      // Update user
      await prisma.users.update({
        where: {
          Id: +id,
        },
        data: {
          ...updateData,
          Audit: {
            update: {
              UpdatedById: userId,
            },
          },
        },
      });

      return res.status(200).send({
        status: 200,
        message: "تم تحديث المستخدم بنجاح!",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
      });
    }
  },
  searchUsers: async (req, res) => {
    const searchTerm = req.params.searchTerm;
    try {
      if (!searchTerm) {
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
          PhoneNumber: true,
          Department: {
            select: {
              Id: true,
              Name: true,
              Category: true,
            },
          },
          IsActive: true,
          PhotoPath: true,
        },
      });

      // console.log("USERS FOUND", managers);

      return res.status(200).send({
        status: 200,
        message: "تم جلب المستخدمين بناءً على معايير البحث بنجاح.",
        data: datas,
      });
    } catch (error) {
      console.error("Error searching users:", error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
};

export default AuthenticationController;
