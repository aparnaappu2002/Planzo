import { decodedTokenEntity } from "../../domain/entities/decodedTokenEntity";
import { IjwtInterface } from "../../domain/interfaces/serviceInterface/IjwtService";
import jwt from "jsonwebtoken";
export class JwtService implements IjwtInterface {
  createAccesstoken(
    accessSecretKey: string,
    userId: string,
    role: string
  ): string {
    return jwt.sign({ userId, role }, accessSecretKey, { expiresIn: "30m" });
  }
  createRefreshToken(refreshSecretKey: string, userId: string): string {
    return jwt.sign({ userId }, refreshSecretKey, { expiresIn: "1d" });
  }
  verifyAccessToken(accessToken: string, accessSecretKey: string) {
    try {
      return jwt.verify(accessToken, accessSecretKey) as {
        userId: string;
        role: string;
      };
    } catch (error) {
      return null;
    }
  }
  verifyRefreshToken(
    refreshToken: string,
    refreshSecretKey: string
  ): { userId: string } | null {
    try {
      return jwt.verify(refreshToken, refreshSecretKey) as { userId: string };
    } catch (error) {
      return null;
    }
  }
  generateResetToken(
    resetSecretKey: string,
    userId: string,
    email: string
  ): string {
    return jwt.sign(
      { userId, email, purpose: "password_reset" },
      resetSecretKey,
      { expiresIn: "15m" }
    );
  }
  verifyPasswordResetToken(
    resetToken: string,
    resetSecretKey: string
  ): { userId: string; email: string; purpose: string } | null {
    try {
      const decoded = jwt.verify(resetToken, resetSecretKey) as {
        userId: string;
        email: string;
        purpose: string;
      };
      if (decoded.purpose !== "password_reset") return null;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  tokenDecode(accessToken: string): decodedTokenEntity | null {
    return jwt.decode(accessToken) as decodedTokenEntity;
  }
}
