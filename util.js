exports.formatDate = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    const militaryHours = date.getHours();
    const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
    let hours;
    let meridiem;

    if (militaryHours > 12) {
        hours = militaryHours - 12;
        meridiem = 'PM';
    } else {
        hours = militaryHours;
        meridiem = 'AM';
    }

    return `${month}/${day}/${year} - ${hours}:${minutes}${meridiem}`
};
