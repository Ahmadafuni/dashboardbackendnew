import prisma from "../../client.js";
import bcrypt from "bcrypt";
import {
  doesExist,
  getUser,
  getUserById,
} from "../../Utils/Auth.utils.js";

const SALT_ROUNDS = 12;

const AuthenticationController = {
  login: async (req, res, next) => {
    const { username, password } = req.body;
    console.log("Login attempt:", { username });
    try {
      // Get User
      const user = await getUser(username);
      console.log("User fetched from database:", user);

      // Check User
      if (user === null) {
        console.log("User not found or inactive");
        return res.status(401).send({
          status: 401,
          message: "اسم المستخدم أو كلمة المرور غير صالحة أو الحساب لم يتم تفعيله بعد!",
          data: {},
        });
      }

      // Check Password
      const passMatched = await bcrypt.compare(password, user.PasswordHash);
      console.log("Password match status:", passMatched);
      if (!passMatched) {
        console.log("Incorrect password");
        return res.status(401).send({
          status: 401,
          message: "اسم المستخدم أو كلمة المرور غير صالحة أو الحساب لم يتم تفعيله بعد!",
          data: {},
        });
      }

      // Optionally: Set up session if needed
      // req.session.userId = user.Id;

      // Update last login time
      await prisma.users.update({
        where: { Id: user.Id },
        data: {
          LastLogin: new Date(),
        },
      });
      console.log("User last login time updated");

      return res.status(200).send({
        status: 200,
        message: "تم تسجيل دخول المستخدم بنجاح!",
        data: {
          user: {
            id: user.Id,
            name: `${user.Firstname} ${user.Lastname}`,
            email: user.Email,
            userImage: user.PhotoPath,
            userRole: user.Department.Category,
            userDepartment: user.Department.Name,
            userDepartmentId: user.Department.Id,
            category: user.Department.Category,
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

  signOut: async (req, res) => {
    try {
      console.log("Signing out user");
      // Optionally: Clear session if used
      // req.session.destroy();

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

    console.log("Starting createAdmin function");

    try {
      // Check if file is provided
      if (!file) {
        console.log("File is not provided");
        return res.status(400).send({
          status: 400,
          message: "File is required",
          data: {},
        });
      }

      // Check if department ID is valid
      if (!department) {
        console.log("Department ID is not provided");
        return res.status(400).send({
          status: 400,
          message: "Department ID is required",
          data: {},
        });
      }

      console.log("Checking if user credentials already exist");
      // Check user credentials already exist
      const doesExistUser = await doesExist({ username, email, phoneNumber });
      if (doesExistUser != null) {
        console.log("User credentials already exist", doesExistUser);
        return res.status(409).send({
          status: 409,
          message: doesExistUser,
          data: {},
        });
      }

      console.log("Hashing password");
      // Hash password for safe keeping
      const hashedPass = await bcrypt.hash(password, SALT_ROUNDS);

      console.log("Creating new user in the database");
      // Create new user
      const newUser = await prisma.users.create({
        data: {
          Email: email,
          Firstname: firstname,
          Lastname: lastname,
          PasswordHash: hashedPass,
          Username: username,
          PhoneNumber: phoneNumber,
          IsActive: true,
          Department: {
            connect: {
              Id: +department,
            },
          },
          PhotoPath: `/${file.destination.split("/")[1]}/${file.filename}`,
          Audit: {
            create: {
              CreatedAt: new Date(),
            },
          },
        },
      });

      console.log("New user created successfully", newUser);

      // If success return success response
      return res.status(201).send({
        status: 201,
        message: "تم إنشاء مدير جديد بنجاح!",
        data: {},
      });
    } catch (error) {
      console.error("Error occurred in createAdmin function", error);
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {
          error: error.message, // Include the error message in the response
          stack: error.stack    // Optionally include the stack trace
        },
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

    console.log("Creating new user:", { username, email, department });

    try {
      // Check if user credentials already exist
      const doesExistUser = await doesExist({ username, email, phoneNumber });
      if (doesExistUser != null) {
        console.log("User credentials already exist:", doesExistUser);
        return res.status(409).send({
          status: 409,
          message: doesExistUser,
          data: {},
        });
      }

      // Hash password for safe keeping
      const hashedPass = await bcrypt.hash(password, SALT_ROUNDS);

      console.log("Hashing password and saving new user to database");
      // Create new user
      await prisma.users.create({
        data: {
          Email: email,
          Firstname: firstname,
          Lastname: lastname,
          PasswordHash: hashedPass,
          Username: username,
          PhoneNumber: phoneNumber,
          Department: {
            connect: {
              Id: +department,
            },
          },
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

      console.log("New user created successfully");

      return res.status(201).send({
        status: 201,
        message: "تم إنشاء مستخدم جديد بنجاح!",
        data: {},
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  getAllUsers: async (req, res, next) => {
    console.log("Fetching all users");
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

      console.log("Users fetched successfully");

      return res.status(200).send({
        status: 200,
        message: "تم جلب جميع المستخدمين بنجاح!",
        data: users,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  getUserById: async (req, res, next) => {
    const id = req.params.id;
    console.log("Fetching user by ID:", id);
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
        console.log("User not found");
        return res.status(404).send({
          status: 404,
          message: "User not found!",
          data: {},
        });
      }

      console.log("User found:", user);

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
      console.error("Error fetching user by ID:", error);
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
    console.log("Toggling user active status for user ID:", toggleUserId);
    try {
      const user = await getUserById(+toggleUserId);
      if (!user) {
        console.log("User not found");
        return res.status(404).send({
          status: 404,
          message: "User not found!",
          data: {},
        });
      }

      console.log("User found:", user);

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

      console.log("User active status toggled");

      return res.status(200).send({
        status: 200,
        message: "تم تبديل حالة المستخدم بنجاح!",
        data: {},
      });
    } catch (error) {
      console.error("Error toggling user status:", error);
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
    console.log("Deleting user with ID:", id);
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

      console.log("User deleted successfully");

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

    console.log("Updating user with ID:", id);

    try {
      // Ensure the user exists
      const existingUser = await prisma.users.findUnique({
        where: {
          Id: +id,
        },
      });

      if (!existingUser) {
        console.log("User not found");
        return res.status(404).send({
          status: 404,
          message: "المستخدم غير موجود!",
        });
      }

      console.log("User found:", existingUser);

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
        PhotoPath: file
            ? `/${file.destination.split("/")[1]}/${file.filename}`
            : existingUser.PhotoPath,
      };

      // Only add Username to updateData if it's different and provided
      if (username && username !== existingUser.Username) {
        updateData.Username = username;
      }

      console.log("Updating user with data:", updateData);

      // Update user
      await prisma.users.update({
        where: {
          Id: +id,
        },
        data: {
          ...updateData,
          Department: {
            connect: {
              Id: +department,
            },
          },
          Audit: {
            update: {
              UpdatedById: userId,
            },
          },
        },
      });

      console.log("User updated successfully");

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
    console.log("Searching users with term:", searchTerm);
    try {
      if (!searchTerm) {
        console.log("No search term provided");
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

      console.log("Users found:", datas.length);

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
