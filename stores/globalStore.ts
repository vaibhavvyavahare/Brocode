import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GlobalState {
  rateFloor: number;
  currency: string;
  setRateFloor: (value: number) => void;
  setCurrency: (value: string) => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      rateFloor: 500,
      currency: '₹',
      setRateFloor: (value) => set({ rateFloor: value }),
      setCurrency: (value) => set({ currency: value }),
    }),
    {
      name: 'billable-global-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
