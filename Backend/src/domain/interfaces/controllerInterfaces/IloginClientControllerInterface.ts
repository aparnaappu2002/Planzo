import { Request,Response } from "express";
export interface IloginClientControllerInterface{
    handleLogin(req:Request,res:Response):Promise<void>
}