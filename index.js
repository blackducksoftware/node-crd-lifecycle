const express = require('express');
const app = express();
const path = require('path');

// const Client = require('kubernetes-client').Client;
// const config = require('kubernetes-client').config;
// const client = new Client({ config: config.getInCluster() });
//
// const x = async() => {
//     await client.loadSpec();
// }
// x();

const Client = require('kubernetes-client').Client;
const config = require('kubernetes-client').config;
const client = new Client({ config: config.fromKubeconfig(), version: '1.9' });
// const x = {
//     namespace: 'jay1',
//     flavor: 'small',
//     hubTimeout: '2',
//     dockerRegistry: 'docker.io',
//     dockerRepo: 'blackducksoftware',
//     hubVersion: '4.6.1',
//     status: 'pending'
// }
// const z = {
//     namespace: 'jay2',
//     flavor: 'small',
//     hubTimeout: '4',
//     dockerRegistry: 'docker.io',
//     dockerRepo: 'blackducksoftware',
//     hubVersion: '4.6.1',
//     status: 'pending'
// }
// client.api.v1.namespaces('default')
//     .configmaps('saas-customers')
//     .get()
//     .then((resp) => {
//         const { body } = resp;
//         const y = JSON.stringify(x);
//         const a = JSON.stringify(z);
//         const newBody = {
//             ...body,
//             'data': {
//                 'jay1' : `${y}`,
//                 'jay2' : `${a}`
//             }
//         };
//         client.api.v1.namespaces('default')
//             .configmaps('saas-customers')
//             .put({
//                 body: newBody
//             })
//     })

// client.api.v1.namespaces('default')
//     .configmaps('saas-customers')
//     .get()
//     .then((response) => {
//         console.log('saas-customers', response);
//     })

const token = 'RGB';

app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'client', 'build', 'static')));

const tokenIsInvalid = (req, res) => {
    const rgbToken = req.get('rgb-token');
    if (!rgbToken || rgbToken !== token) {
        return res.status(403).json({ error: 'Token is either null or invalid' });
    }
}

app.listen(3001, () => console.log('Sachin is alive!'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

app.get('/api/customers', (req, res) => {
    if (!tokenIsInvalid(req, res)) {
        client.api.v1.namespaces('default')
            .configmaps('saas-customers')
            .get()
            .then((response) => {
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
            })
        res.sendStatus(200);
    }
})
