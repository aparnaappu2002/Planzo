export interface ShowProfileClientResponseDTO {
  _id: string;        
  clientId: string;   

  name: string;
  email: string;
  phone: number;

  profileImage?: string;
  status?: 'active' | 'block';
  googleVerified?: boolean;
}
