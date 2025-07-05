import { create } from 'zustand'

interface Store {
  count: number
  inc: (action: string) => void
}
export const useStore = create<Store>((set) => ({
  count: 1,
  inc: (evt: string) =>
    set((state: { count: number }) => {
      if (evt === 'plus') {
        return { count: state.count + 1 }
      } else {
        return { count: state.count - 1 }
      }
    }),
}))
