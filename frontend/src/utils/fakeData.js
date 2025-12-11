import { faker } from '@faker-js/faker';

export const generateFakeUser = (role = 'student') => {
  const baseData = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
  };

  if (role === 'student') {
    return {
      ...baseData,
      role: 'student',
      nric: faker.string.numeric(12), // Malaysian NRIC format: 12 digits
      // Or more realistic: `${faker.string.numeric(6)}-${faker.string.numeric(2)}-${faker.string.numeric(4)}`
    };
  }

  if (role === 'coach') {
    return {
      ...baseData,
      role: 'coach',
      staffId: `COACH${faker.string.numeric(5)}`,
      sport: faker.helpers.arrayElement(['football', 'volleyball', 'sepak_takraw', 'badminton']),
    };
  }

  if (role === 'exco') {
    return {
      ...baseData,
      role: 'exco',
      staffId: `EXCO${faker.string.numeric(5)}`,
    };
  }

  return baseData;
};