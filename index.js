const express = require('express');
const app = express();
const path = require('path');
const Client = require('kubernetes-client').Client;
const config = require('kubernetes-client').config;
let client;

// try in-cluster config, otherwise fall back to local minikube config
try {
    client = new Client({ config: config.getInCluster() });
    const loadConfig = async () => {
        await client.loadSpec();
    }
    loadConfig();
    console.log('In cluster');
} catch (e) {
    client = new Client({ config: config.fromKubeconfig(), version: '1.9' });
    console.log('Out of cluster');
}

const token = process.env.TOKEN;

app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'client', 'build', 'static')));

const tokenIsInvalid = (req, res) => {
    const rgbToken = req.get('rgb-token');
    if (!rgbToken || rgbToken !== token) {
        return res.status(403).json({ error: 'Token is either null or invalid' });
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

app.listen(3001, () => console.log('Node server running on port 3001'))

app.get('/api/customers', (req, res) => {
    if (!tokenIsInvalid(req, res)) {
        client.api.v1.namespaces('default')
            .configmaps('saas-customers')
            .get()
            .then((response) => {
                console.log('/api/customers - configmap received:' + response.body.data);
                const customers = response.body.data;
                const namespaces = Object.keys(customers);
                const realData = namespaces.reduce((obj, namespace) => {
                    const stagingData = JSON.parse(customers[namespace]);
                    obj[namespace] = stagingData;
                    return obj;
                }, {})
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(realData));
            })
            .catch((error) => {
                console.log(error);
            })
    }
})

app.post('/api/customers', (req, res) => {
    if (!tokenIsInvalid(req, res)) {
        const { namespace } = req.body;
        const jsonData = JSON.stringify(req.body);

        client.api.v1.namespaces('default')
            .configmaps('saas-customers')
            .get()
            .then((resp) => {
                console.log('/api/customers - configmap received');
                const { body } = resp;
                const { data } = body;
                const newBody = {
                    ...body,
                    'data': {
                        ...data,
                        [namespace]: `${jsonData}`
                    }
                };
                client.api.v1.namespaces('default')
                    .configmaps('saas-customers')
                    .patch({
                        body: newBody
                    })
                    .then(() => {
                        console.log('/api/customers - configmap PATCH success');
                        res.sendStatus(200);
                    })
            })
            .catch((error) => {
                console.log(error);
            })
    }
})
