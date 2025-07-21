import express,{Express,urlencoded} from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { connectMongo } from './framework/database/databaseConnection/dbConnection'
import { clientRoute } from './framework/routes/client/clientRoute'
import { VendorRoute } from './framework/routes/vendor/vendorRoute'


export class App{
    private app:Express
    private database:connectMongo
    constructor(){
        dotenv.config()
        this.app=express()
        this.database=new connectMongo()
        this.database.connectDb()
        this.setMiddlewares()
        this.setClientRoute()
        this.setVendorRoute()
    }
    private setMiddlewares(){
        this.app.use(cors({
            origin:process.env.ORGIN,
            credentials:true
        }))
        this.app.use(cookieParser())
        this.app.use(express.json())
        this.app.use(urlencoded({extended:true}))
        this.app.use(morgan('dev'))
    }
    private setClientRoute(){
        this.app.use('/user',new clientRoute().clientRoute)
    }
    private setVendorRoute(){
        this.app.use('/vendor',new VendorRoute().vendorRoute)
    }
    public listen()
    {
        const port = process.env.PORT
        this.app.listen(port,()=>console.log(`server running on ${port}`))
    }
}
