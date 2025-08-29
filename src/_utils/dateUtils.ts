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

export {
  toDefaultDateFormat,
  toDisplayDateTimeFormat,
  toDefaultDateTimeFormat,
};
