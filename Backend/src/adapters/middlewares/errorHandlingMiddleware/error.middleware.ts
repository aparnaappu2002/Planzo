import { NextFunction,Request,Response } from "express";
import { Messages } from "../../../domain/enums/messages";
import { HttpStatus } from "../../../domain/enums/httpStatus";

export const errorHandler =(err:any,req:Request,res:Response,next:NextFunction) =>{
    const statusCode:number=err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
    const message=err.message || Messages.SERVER_ERROR

    res.status(statusCode).json({success:false,statusCode,message})
}