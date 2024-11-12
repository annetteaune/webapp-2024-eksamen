import type { User } from "@/types";
import type { Result } from "@/types";
import type { UserRepository } from "../repository";

export type UserService = ReturnType<typeof createUserService>;

export const createUserService = (userRepository: UserRepository) => {
  const getAllUsers = async (): Promise<Result<User[]>> => {
    return userRepository.findAll();
  };

  const createUser = async (
    userData: Omit<User, "id">
  ): Promise<Result<User>> => {
    return userRepository.create(userData);
  };

  return {
    getAllUsers,
    createUser,
  };
};
