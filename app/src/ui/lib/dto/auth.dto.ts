export interface SignUpDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginDto {
  email: string;
  password: string;
  remember: boolean;
}

export interface UpdateUserDto {
  name: string;
  email: string;
}
