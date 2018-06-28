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

exports.formatInstanceData = (resp) => {
    const instanceEntries = Object.entries(resp.body.Hubs);
    return instanceEntries.reduce((obj, instance, index, array) => {
        const { HealthReport, ...rest } = instance[1];
        const totalContainerRestartCount = getTotalContainerRestarts(HealthReport);
        const unhealthyPodsCount = getUnhealthyPods(HealthReport);
        const badEventsCount = getBadEvents(HealthReport);
        obj[index] = {
            ...rest,
            totalContainerRestartCount,
            unhealthyPodsCount,
            badEventsCount
        }
        return obj;
    }, {});
}

const getTotalContainerRestarts = (data) => {
    const restartEntries = Object.entries(data.Derived.ContainerRestarts);
    return restartEntries.reduce((count, container, index, array) => {
        count += container[1];
        return count;
    }, 0);
};

const getUnhealthyPods = (data) => {
    const podEntries = Object.entries(data.PodHealth);
    if (!podEntries.length) {
        return 0;
    }

    return podEntries.reduce((count, pod, index, array) => {
        if (pod[1].status !== 'Running') {
            count++;
        }
        return count;
    }, 0);
};

const getBadEvents = (data) => {
    const eventsEntries = Object.entries(data.Events);
    if (!eventsEntries.length) {
        return 0;
    }

    //TODO: need example of Events array with data
    return 2;
};
