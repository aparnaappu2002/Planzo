import { Request, Response } from "express";
import { IadminLoginUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/authentication/IadminLoginUseCase";
import { IjwtInterface } from "../../../../domain/interfaces/serviceInterface/IjwtService";
import { IredisService } from "../../../../domain/interfaces/serviceInterface/IredisService";
import { setCookie } from "../../../../framework/services/tokenCookieSetting";
import { HttpStatus } from "../../../../domain/entities/httpStatus";
import { json } from "stream/consumers";

export class AdminLoginController {
  private adminLoginUseCase: IadminLoginUseCase;
  private jwtService: IjwtInterface;
  private redisService: IredisService;

  constructor(
    adminLoginUseCase: IadminLoginUseCase,
    jwtService: IjwtInterface,
    redisService: IredisService
  ) {
    this.adminLoginUseCase = adminLoginUseCase;
    this.jwtService = jwtService;
    this.redisService = redisService;
  }

  async handleAdminLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      console.log(req.body);
      if (!email) {
        res.status(HttpStatus.BAD_REQUEST).json({
          message: "Invalid email",
        });
        return;
      } else if (!password) {
        res.status(HttpStatus.BAD_REQUEST).json({
          message: "Invalid password",
        });
      }
      const admin = await this.adminLoginUseCase.handleLogin(email, password);
      if (!admin) {
        res.status(HttpStatus.BAD_REQUEST).json({
          message: "Invalid credentials",
        });
        return;
      }
      const accessSecretKey = process.env.ACCESSTOKEN_SECRET_KEY as string;
      const refreshSecretKey = process.env.REFRESHTOKEN_SECRET_KEY as string;
      const accessToken = await this.jwtService.createAccesstoken(
        accessSecretKey,
        admin._id?.toString() || "",
        admin.role
      );
      const refreshToken = await this.jwtService.createRefreshToken(
        refreshSecretKey,
        admin._id?.toString() || ""
      );
      await this.redisService.set(
        `user:admin:${admin._id}`,
        15 * 60,
        JSON.stringify(admin.status)
      );
      await this.redisService.set(
        `adminRole`,
        15 * 60,
        JSON.stringify(admin.isAdmin)
      );
      setCookie(res, refreshToken);
      res.status(HttpStatus.OK).json({
        message: "Admin logged",
        accessToken,
        id: admin._id,
      });
      return;
    } catch (error) {
      console.log("Error while admin login", error);
      res.status(HttpStatus.BAD_REQUEST).json({
        message: "error while login admin",
        error:
          error instanceof Error ? error.message : "error while login admin",
      });
    }
  }
}
