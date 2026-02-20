export interface LoginClientDTO {
 id:string,
  clientId: string
  name: string
  email: string
  phone: number
  role: 'client' 
  status?: 'active' | 'block'
  profileImage?: string
  lastLogin?: Date
}
