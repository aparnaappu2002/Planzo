export interface CreateClientRequestDTO {
  name: string
  email: string
  phone: number
  password?: string        
  googleVerified?: boolean
}
