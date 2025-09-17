function toDefaultDateFormat(date?: Date): string {
  if (!date) {
    return '';
  }
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // https://stackoverflow.com/questions/18624326/getmonth-in-javascript-gives-previous-month
  const day = date.getDate();
  // yyyy-MM-dd
  return `${year}-${month.toString().length < 2 ? '0' + month : month}-${day.toString().length < 2 ? '0' + day : day}`;
}

function toDisplayDateTimeFormat(date?: Date): string {
  if (!date) {
    return '';
  }
  const formatter = Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
    hour12: true,
  });
  // yyyy-MM-dd HH-mn XX
  return formatter.format(date);
}

function toDefaultDateTimeFormat(date: string): string {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // https://stackoverflow.com/questions/18624326/getmonth-in-javascript-gives-previous-month
  const day = dateObj.getDate();
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  // yyyy-MM-ddTHH:mm
  const monthStr = month.toString().length < 2 ? '0' + month : month;
  const dayStr = day.toString().length < 2 ? '0' + day : day;
  const hoursStr = hours.toString().length < 2 ? '0' + hours : hours;
  const minutesStr = minutes.toString().length < 2 ? '0' + minutes : minutes;
  return `${year}-${monthStr}-${dayStr}T${hoursStr}:${minutesStr}`;
}

function to12HourFormat(timeString: string): string {
  const [hoursStr, minutesStr] = timeString.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert 0 -> 12 and 13-23 -> 1-11

  return `${hours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  const hasBirthdayPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());

  if (!hasBirthdayPassed) {
    age--;
  }

  return age;
}

export {
  toDefaultDateFormat,
  toDisplayDateTimeFormat,
  toDefaultDateTimeFormat,
  to12HourFormat,
  calculateAge,
};
