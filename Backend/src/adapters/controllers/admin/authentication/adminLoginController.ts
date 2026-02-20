import { Request, Response } from "express";
import { IadminLoginUseCase } from "../../../../domain/interfaces/useCaseInterfaces/admin/authentication/IadminLoginUseCase";
import { IjwtInterface } from "../../../../domain/interfaces/serviceInterface/IjwtService";
import { IredisService } from "../../../../domain/interfaces/serviceInterface/IredisService";
import { setCookie } from "../../../../framework/services/tokenCookieSetting";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { Messages } from "../../../../domain/enums/messages";
import { handleErrorResponse,logError } from "../../../../framework/services/errorHandler";
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

  private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }


  async handleAdminLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      //console.log(req.body);
      if (!email || !this.isValidEmail(email)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          message: Messages.INVALID_EMAIL,
        });
        return;
      } 
      if (!password || password.trim().length<6) {
        res.status(HttpStatus.BAD_REQUEST).json({
          message: Messages.INVALID_PASSWORD,
        });
      }
      const admin = await this.adminLoginUseCase.handleLogin(email, password);
      if (!admin) {
        res.status(HttpStatus.BAD_REQUEST).json({
          message: Messages.INVALID_CREDENTIALS,
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
        message: Messages.LOGIN_SUCCESS,
        accessToken,
        id: admin._id,
      });
      return;
    } catch (error) {
      logError("Error while admin login", error);
      handleErrorResponse(req, res, error, Messages.LOGIN_ERROR);
    }
  }
}
