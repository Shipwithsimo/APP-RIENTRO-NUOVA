import { Contact, User } from './types';

export const MOCK_USER: User = {
  name: "Sara",
  email: "sara.milan@example.com",
  avatar: "https://picsum.photos/id/64/200/200"
};

export const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    name: "Giulia",
    role: "Sorella",
    phone: "+39 333 1234567",
    avatar: "https://picsum.photos/id/338/200/200",
    isEmergency: true
  },
  {
    id: '2',
    name: "Marco",
    role: "Compagno",
    phone: "+39 333 9876543",
    avatar: "https://picsum.photos/id/342/200/200",
    isEmergency: true
  },
  {
    id: '3',
    name: "Mamma",
    role: "Genitore",
    phone: "+39 333 5555555",
    avatar: "https://picsum.photos/id/334/200/200",
    isEmergency: false
  }
];

export const MAP_PLACEHOLDER_URL = "https://picsum.photos/id/10/800/1200"; // Abstract darker image for map vibe