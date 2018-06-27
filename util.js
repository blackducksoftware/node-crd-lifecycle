exports.tokenIsInvalid = ({ req, res, token }) => {
    const rgbToken = req.get('rgb-token');
    console.log(`Server token: ${token}; Request Token: ${rgbToken}`);
    if (!rgbToken || rgbToken !== token) {
        return res.status(403).json({ error: 'Token is either null or invalid' });
    }
}

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

exports.getModel = ({ httpLib, urls }) => {
    return httpLib(urls.getModel, { json: true });
}

exports.createInstance = ({ httpLib, urls, body }) => {
    return httpLib.post(urls.crudHub, { json: true, body });
}
