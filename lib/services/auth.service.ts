// Service d'authentification
// Gère l'inscription, la connexion, le refresh token et la déconnexion

import bcrypt from "bcryptjs";
import { userRepository } from "@/lib/repositories/user.repository";
import { clientRepository } from "@/lib/repositories/client.repository";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/lib/utils/jwt";
import { prisma } from "@/lib/prisma";

const SALT_ROUNDS = 12;

export const authService = {
  // Connexion : vérifie les identifiants et retourne les tokens
  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw { statusCode: 401, message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
    }

    if (!user.isActive) {
      throw { statusCode: 403, message: "هذا الحساب غير نشط" };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw { statusCode: 401, message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
    }

    const payload = { userId: user.id, email: user.email, role: user.role, nom: user.nom, prenom: user.prenom };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await userRepository.updateRefreshToken(user.id, refreshToken);
    await userRepository.updateLastLogin(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  },

  // Inscription d'un nouvel avocat (admin)
  async register(data: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    telephone?: string;
  }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw { statusCode: 409, message: "هذا البريد الإلكتروني مستخدم بالفعل" };
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await userRepository.create({
      email: data.email,
      password: hashedPassword,
      nom: data.nom,
      prenom: data.prenom,
      telephone: data.telephone,
      role: "admin",
    });

    const payload = { userId: user.id, email: user.email, role: user.role, nom: user.nom, prenom: user.prenom };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await userRepository.updateRefreshToken(user.id, refreshToken);

    return {
      user: { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom, role: user.role },
      accessToken,
      refreshToken,
    };
  },

  // Rafraîchir le token
  async refresh(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await userRepository.findById(decoded.userId);

      if (!user || user.refreshToken !== refreshToken) {
        throw { statusCode: 401, message: "رمز التحديث غير صالح" };
      }

      const payload = { userId: user.id, email: user.email, role: user.role, nom: user.nom, prenom: user.prenom };
      const newAccessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);

      await userRepository.updateRefreshToken(user.id, newRefreshToken);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw { statusCode: 401, message: "رمز التحديث غير صالح أو منتهي الصلاحية" };
    }
  },

  // Déconnexion
  async logout(userId: string) {
    await userRepository.updateRefreshToken(userId, null);
  },

  // Inscription d'un client (créé par l'avocat)
  async registerClient(data: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    telephone: string;
    cin: string;
  }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw { statusCode: 409, message: "هذا البريد الإلكتروني مستخدم بالفعل" };
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          nom: data.nom,
          prenom: data.prenom,
          telephone: data.telephone,
          role: "client",
        },
      });

      const client = await tx.client.create({
        data: {
          nom: data.nom,
          prenom: data.prenom,
          cin: data.cin,
          telephone: data.telephone,
        },
      });

      await tx.user.update({
        where: { id: newUser.id },
        data: { clientId: client.id },
      });

      return { user: newUser, client };
    });

    return user;
  },
};
