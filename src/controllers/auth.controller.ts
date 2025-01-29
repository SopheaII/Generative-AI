import { comparePassword, encryptPassword, generateToken } from '../utils/encrypt';
import { Request, Response } from "express";
import { UserInfo } from "../entity/user.entity";
import { AppDataSource } from '../config';
import { RoleEnum, RoleType } from '../common';

export const register = async (req: Request, res: Response) => {
  const userRepo = AppDataSource.getRepository(UserInfo);
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(500).json({
      message: "something wrong",  
    });
  }

  const validUser = await userRepo.findOne({ where: { userEmail: email } });
  if (validUser) {
    return res.status(400).json({
      message: "user already exist!",
    });
  }

  const hashPassword = await encryptPassword(password);
  const user = new UserInfo();
  user.name = name;
  user.userEmail = email;
  user.password = hashPassword;

  await userRepo.save(user);

  const token = generateToken({ id: user.id, role: RoleEnum[2] });

  return res
    .status(200)
    .json({ message: "User created successfully", token });
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(500).json({
        message: "email and password are required",
      });
    }
    const userRepo = AppDataSource.getRepository(UserInfo);
    const user = await userRepo.findOne({ where: { userEmail :email } });

    if (!user) {
      return res.status(400).json({
        _message: "User not found!",
        get message() {
          return this._message;
        },
        set message(value) {
          this._message = value;
        },
      });
    }

    const isPasswordValid = comparePassword(user.password, password);
    if (!user || !isPasswordValid) {
      return res.status(404).json({ message: "User not found" });
    }
    const token = generateToken({ id: user.id, role: user.role as RoleType });
    return res.status(200).json({ message: "Login Successfully", token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};