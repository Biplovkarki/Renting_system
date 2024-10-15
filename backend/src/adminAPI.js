import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { verifyJwt, blacklistToken } from './jwtAdmin.js';
import dotenv from 'dotenv';

dotenv.config();
const routerAdmin = express.Router();
const JWT_SECRET = process.env.JWT_SECRET_KEY;

