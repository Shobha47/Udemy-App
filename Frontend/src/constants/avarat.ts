export const INSTRUCTOR_FALLBACKS: { [key: number]: any } = {
  1: require('../assets/instructor-1.png'),
  2: require('../assets/instructor-2.png'),
  3: require('../assets/instructor-3.png'),
  4: require('../assets/instructor-4.png'),
  5: require('../assets/instructor-5.png'),
  6: require('../assets/instructor-6.png'),
};

// Helper function to get an image safely based on any ID or index string/number
export const getFallbackAvatar = (id: any) => {
  const numericId = parseInt(id, 10) || 1;
  // Modulo math to ensure the result is always a number between 1 and 6
  const imageIndex = ((numericId - 1) % 6) + 1; 
  return INSTRUCTOR_FALLBACKS[imageIndex];
};