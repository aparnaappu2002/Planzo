import { Response } from "express";
export const setCookieVendor = (res:Response,refreshToken:string)=>{
    const maxAge = Number(process.env.REFRESH_TOKEN_MAX_AGE);

    res.cookie('vendor_refresh',refreshToken,{
        httpOnly:true,
        secure:false,
        maxAge:maxAge
    })
}