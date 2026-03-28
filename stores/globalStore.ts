import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GlobalState {
  rateFloor: number;
  currency: string;
  refreshTrigger: number;
  setRateFloor: (value: number) => void;
  setCurrency: (value: string) => void;
  triggerRefresh: () => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      rateFloor: 500,
      currency: '₹',
      refreshTrigger: 0,
      setRateFloor: (value) => set({ rateFloor: value }),
      setCurrency: (value) => set({ currency: value }),
      triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
    }),
    {
      name: 'billable-global-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
