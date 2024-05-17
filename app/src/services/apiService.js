import API from './api'; // Import the configured axios instance

export const fetchActivities = () => {
  return API.get('activities');
};

export const fetchChildren = (parentId) => {
  return API.get(`users/${parentId}/children`);
};

export const bookActivity = (bookingInfo) => {
  return API.post('/booking/bookActivity', bookingInfo);
};
