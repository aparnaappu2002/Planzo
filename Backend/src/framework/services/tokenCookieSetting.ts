import { Response } from "express";
export const setCookie = (res:Response,refreshToken:string)=>{
    const maxAge = Number(process.env.REFRESH_TOKEN_MAX_AGE);

    res.cookie('refreshtoken',refreshToken,{
        httpOnly:true,
        secure:false,
        maxAge:maxAge
    })
}