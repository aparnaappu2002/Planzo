import { Request,Response, Router } from "express";
import { injectedAdminLoginController } from "../../inject/adminInject";


export class AdminRoute{
    public adminRoute:Router
    constructor(){
        this.adminRoute=Router()
        this.setRoute()
    }

    private setRoute(){
        this.adminRoute.post('/login',(req:Request,res:Response)=>{
            injectedAdminLoginController.handleAdminLogin(req,res)
        })
    }
}