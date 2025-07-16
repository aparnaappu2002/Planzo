import { clientEntity } from "../../../domain/entities/clientEntity";
import { IClientDatabaseRepository } from "../../../domain/interfaces/repositoryInterfaces/client/clientDatabaseRepository";
import { IjwtInterface } from "../../../domain/interfaces/serviceInterface/IjwtService";
import bcrypt from 'bcrypt'
import { IresetPasswordClientUseCase } from "../../../domain/interfaces/useCaseInterfaces/client/authentication/IforgotPassword";

export class ResetPasswordClientUseCase implements IresetPasswordClientUseCase{
     private jwtService:IjwtInterface
     private clientDatabase:IClientDatabaseRepository

     constructor(jwtService:IjwtInterface,clientDatabase:IClientDatabaseRepository){
        this.jwtService=jwtService
        this.clientDatabase=clientDatabase
     }

    async resetPassword(email: string, newPassword: string, token: string): Promise<void> {
        const isValidToken = await this.jwtService.verifyPasswordResetToken(token,process.env.RESET_SECRET_KEY!)
        if(!isValidToken){
            throw new Error("Invalid or expired reset token")
        }
        const client = await this.clientDatabase.findByEmail(email)
        if(!client){
            throw new Error("No client found with this email")
        }
        
        const hashedPassword = await bcrypt.hash(newPassword,10)
        const updatedClient = await this.clientDatabase.resetPassword(client.clientId,hashedPassword)

        if(!updatedClient)
        {
            throw new Error("Failed to update password. Client may no longer exist.")
        }

        
    }
}