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

export { toDefaultDateFormat };
