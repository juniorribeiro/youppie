export class UpdateUserDto {
    name?: string;
    email?: string;
}

export class UpdatePasswordDto {
    currentPassword: string;
    newPassword: string;
}

