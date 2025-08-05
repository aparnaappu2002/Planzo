import { Request, Response } from "express";
import { IloginVendorUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/authentication/IloginVendorUseCase";
import { IjwtInterface } from "../../../../domain/interfaces/serviceInterface/IjwtService";
import { IredisService } from "../../../../domain/interfaces/serviceInterface/IredisService";
import { setCookie } from "../../../../framework/services/tokenCookieSetting";
import { HttpStatus } from "../../../../domain/entities/httpStatus";

export class LoginVendorController {
  private vendorLoginUseCase: IloginVendorUseCase;
  private jwtService: IjwtInterface;
  private redisService: IredisService;
  constructor(
    vendorLoginUseCase: IloginVendorUseCase,
    jwtService: IjwtInterface,
    redisService: IredisService
  ) {
    this.vendorLoginUseCase = vendorLoginUseCase;
    this.jwtService = jwtService;
    this.redisService = redisService;
  }

  async handleLoginVendor(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
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
      setCookie(res, refreshToken);
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
      res.status(HttpStatus.BAD_REQUEST).json({
        message: "error while login vendor",
        error:
          error instanceof Error ? error.message : "error while login vendor",
      });
      return;
    }
  }
}
