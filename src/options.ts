import { parseEther } from 'ethers'

export const levelOptions = {
  [1 as number]: {
    points: 0,
    health: 0,
  },
  2: {
    points: 100000,
    health: parseEther('100000'),
  },
  3: {
    points: 1000000,
    health: parseEther('1000000'),
  },
}
