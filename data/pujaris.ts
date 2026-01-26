export type Pujari = {
  id: string;
  name: string;
  experience: number;
  languages: string[];
  pujaIds: string[]; // which pujas they perform
};

export const PUJARIS: Pujari[] = [
  {
    id: 'p1',
    name: 'Sharma Ji',
    experience: 12,
    languages: ['Hindi', 'Sanskrit'],
    pujaIds: ['1', '2'],
  },
  {
    id: 'p2',
    name: 'Ravi Shastri',
    experience: 8,
    languages: ['Telugu', 'Hindi'],
    pujaIds: ['3'],
  },
  {
    id: 'p3',
    name: 'Krishna Murthy',
    experience: 15,
    languages: ['Tamil', 'Sanskrit'],
    pujaIds: ['1', '4'],
  },
];
