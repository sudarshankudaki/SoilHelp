export interface Farmer {
  id: string;
  name: string;
  village: string;
  farmSize: string;
  phone: string;
  date: string;
}

// Initial mock data
export let MOCK_FARMERS: Farmer[] = [
  { id: '1', name: 'Ramesh Kumar', village: 'Hassan', farmSize: '5', phone: '9845012345', date: '2024-03-15' },
  { id: '2', name: 'Suresh Gowda', village: 'Mandya', farmSize: '12', phone: '9845067890', date: '2024-03-16' },
  { id: '3', name: 'Malleshappa', village: 'Tumkur', farmSize: '3', phone: '9845011223', date: '2024-03-16' },
];

export const addFarmer = (farmer: Omit<Farmer, 'id' | 'date'>) => {
  const newFarmer: Farmer = {
    ...farmer,
    id: (MOCK_FARMERS.length + 1).toString(),
    date: new Date().toISOString().split('T')[0],
  };
  MOCK_FARMERS = [newFarmer, ...MOCK_FARMERS];
  return newFarmer;
};

export const getFarmers = () => MOCK_FARMERS;
