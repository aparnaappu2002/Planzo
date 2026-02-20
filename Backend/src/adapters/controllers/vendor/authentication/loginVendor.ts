import { Request, Response } from "express";
import { IloginVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/authentication/IloginVendorUseCase";
import { IjwtInterface } from "../../../../domain/interfaces/serviceInterface/IjwtService";
import { IredisService } from "../../../../domain/interfaces/serviceInterface/IredisService";
import { setCookieVendor } from "../../../../framework/services/tokenCookieSettingVendor";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IvendorLogoutUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/authentication/IvendorLogoutUseCase";
import { handleErrorResponse,logError } from "../../../../framework/services/errorHandler";

export class LoginLogoutVendorController {
  private vendorLoginUseCase: IloginVendorUseCase;
  private jwtService: IjwtInterface;
  private redisService: IredisService;
  private vendorLogoutUseCase:IvendorLogoutUseCase
  constructor(
    vendorLoginUseCase: IloginVendorUseCase,
    jwtService: IjwtInterface,
    redisService: IredisService,
    vendorLogoutUseCase:IvendorLogoutUseCase
  ) {
    this.vendorLoginUseCase = vendorLoginUseCase;
    this.jwtService = jwtService;
    this.redisService = redisService;
    this.vendorLogoutUseCase=vendorLogoutUseCase
  }

  async handleLoginVendor(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Email is required'
                });
                return;
            }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email.trim())) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Invalid email format'
                });
                return;
            }
        if (!password) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Password is required'
                });
                return;
            }

            if (password.length < 6) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Password must be at least 6 characters'
                });
                return;
            }
    
      const vendor = await this.vendorLoginUseCase.loginVendor(email, password);
      const modifiedVendor = {
        _id: vendor?._id,
        email: vendor?.email,
        name: vendor?.name,
        phone: vendor?.phone,
        role: vendor?.role,
        status: vendor?.status,
        vendorId: vendor?.vendorId,
        vendorStatus: vendor?.vendorStatus,
        rejectReason: vendor?.rejectionReason,
        profileImage: vendor?.idProof,
      };
      if (!vendor) throw new Error("Invalid credentials");
      const accessTokenSecretKey = process.env.ACCESSTOKEN_SECRET_KEY as string;
      const refreshTokenSecretKey = process.env
        .REFRESHTOKEN_SECRET_KEY as string;
      const accessToken = await this.jwtService.createAccesstoken(
        accessTokenSecretKey,
        vendor._id?.toString() || "",
        vendor.role
      );
      const refreshToken = await this.jwtService.createRefreshToken(
        refreshTokenSecretKey,
        vendor._id?.toString() || ""
      );
      setCookieVendor(res, refreshToken);
      await this.redisService.set(
        `user:${vendor.role}:${vendor._id}`,
        15 * 60,
        JSON.stringify({
          status: vendor.status,
          vendorStatus: vendor.vendorStatus,
        })
      );
      const valueFromRedis = await this.redisService.get(
        `user:${vendor.role}:${vendor._id}`
      );
      console.log("value from redis", valueFromRedis);
      res
        .status(HttpStatus.OK)
        .json({
          message: "vendor login successfull",
          vendor: modifiedVendor,
          accessToken,
        });
      return;
    } catch (error) {
      logError("Error while vendor login", error);
      handleErrorResponse(req, res, error, "Error while login vendor");
      return;
    }
  }

  async handleVendorLogout(req: Request, res: Response): Promise<void> {
        try {
                const authHeader=req.headers.authorization
                
                if(!authHeader || !authHeader.startsWith('Bearer ')){
                    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Authorization header missing' });
                    return;
                }
                const token = authHeader.split(' ')[1];
                
                await this.vendorLogoutUseCase.vendorLogout(token);

                res.status(HttpStatus.OK).json({ message: "Logout successful" });

        } catch (error) {
            logError('Error while handling vendor logout', error);
            handleErrorResponse(req, res, error, 'Error while handling logout vendor');
        }
    }

}
