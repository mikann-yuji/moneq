import { useMachine } from '@xstate/react';
import { authMachine } from './machine';
import { useAuthStore } from './store';
import { User } from 'firebase/auth';
import { importDek } from '@/utils/crypto';
import { useRouter } from 'next/navigation';

const [state, send] = useMachine(authMachine);
const { setUser, setDek, clear } = useAuthStore();
const router = useRouter();

export const useAuth = () => {
  return {
    loadUserInfo: async (user?: User) => {
      if (user) {
        setUser(user);
        const rawDEK = localStorage.getItem("dek");
        if (rawDEK) {
          const dek = await importDek(rawDEK);
          setDek(dek);
        } else {
          router.push('/signin');
        }
      } else {
        setDek(undefined);
        localStorage.removeItem('dek');
        router.push('/signin');
      }
    } 
  }
}