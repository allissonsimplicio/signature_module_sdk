import { AxiosInstance } from 'axios';
import { User, CreateUserDto, CreateUserResponse, UpdateUserDto, UserFilters } from '../types/user.types';
/**
 * UserService - Gerenciamento de Usuários (FASE 11)
 */
export declare class UserService {
    private httpClient;
    constructor(httpClient: AxiosInstance);
    /**
     * Criar novo usuário (registro público)
     */
    create(data: CreateUserDto): Promise<CreateUserResponse>;
    /**
     * Listar usuários com filtros
     */
    findAll(filters?: UserFilters): Promise<User[]>;
    /**
     * Obter usuário atual autenticado
     */
    getCurrentUser(): Promise<User>;
    /**
     * Obter usuário por ID
     */
    findOne(id: string): Promise<User>;
    /**
     * Atualizar usuário
     */
    update(id: string, data: UpdateUserDto): Promise<User>;
    /**
     * Deletar usuário
     */
    remove(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=UserService.d.ts.map