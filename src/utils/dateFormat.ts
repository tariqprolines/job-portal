import moment from 'moment';

export function formatDate(createdAt: string | Date) {
  if (!createdAt) {
    return '';  // Return an empty string or some default value if the input is invalid
  }
  const date = moment(createdAt);
  return date.isValid() ? date.format('MMMM D, YYYY') : 'Invalid date';
}
