export interface CreateClientResponseDTO {
  id: string              
  name: string
  email: string
  phone: number
  role: 'client'
  googleVerified?: boolean
}
