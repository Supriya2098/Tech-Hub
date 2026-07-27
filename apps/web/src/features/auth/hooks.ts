import { useMutation } from '@tanstack/react-query';
import { loginRequest, registerRequest } from './api';

export function useLogin() {
  return useMutation({ mutationFn: loginRequest });
}

export function useRegister() {
  return useMutation({ mutationFn: registerRequest });
}
