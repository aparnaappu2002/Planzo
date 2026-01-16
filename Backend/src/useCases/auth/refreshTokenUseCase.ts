import { IadminRepository } from "../../domain/interfaces/repositoryInterfaces/admin/IadminRepositoryInterface";
import { IClientDatabaseRepository } from "../../domain/interfaces/repositoryInterfaces/client/clientDatabaseRepository";
import { IvendorDatabaseRepositoryInterface } from "../../domain/interfaces/repositoryInterfaces/vendor/vendorDatabaseRepository";
import { IjwtInterface } from "../../domain/interfaces/serviceInterface/IjwtService";
import { IrefreshTokenUseCase } from "../../domain/interfaces/useCaseInterfaces/auth/IrefreshTokenUseCase";

export class RefreshTokenUseCase implements IrefreshTokenUseCase {
    private jwtService: IjwtInterface
    private clientRepository: IClientDatabaseRepository
    private vendorRepository: IvendorDatabaseRepositoryInterface
    private adminRepository: IadminRepository
    constructor(jwtService: IjwtInterface,
        clientRepository: IClientDatabaseRepository,
        vendorRepository: IvendorDatabaseRepositoryInterface,
        adminRepository: IadminRepository) {
        this.adminRepository = adminRepository;
            this.clientRepository = clientRepository;
            this.jwtService = jwtService;
            this.vendorRepository = vendorRepository;
    }
    async execute(token: string): Promise<string> {
        const payload = this.jwtService.verifyRefreshToken(token, process.env.REFRESHTOKEN_SECRET_KEY as string)
        if (!payload) throw new Error('Invalid or Expired Refresh Token')
        const userId = payload.userId
        const client = await this.clientRepository.findById(userId)
        const vendor = await this.vendorRepository.findById(userId)
        const admin = await this.adminRepository.findById(userId)

        const user = client || vendor || admin
        const role = client ? 'client' : vendor ? 'vendor' : admin ? 'admin' : null;

        if (!user || !role) throw new Error('User Not Found')

        
        const newAccessToken = this.jwtService.createAccesstoken(process.env.ACCESSTOKEN_SECRET_KEY as string,
            userId,
            role)

        return newAccessToken
    }
}