const express = require('express');
const app = express();
const path = require('path');
const Client = require('kubernetes-client').Client;
const config = require('kubernetes-client').config;
const got = require('got');
const { google } = require('googleapis');
const sqlAdmin = google.sqladmin('v1beta4');
require('dotenv').config()
let client;

// try in-cluster config, otherwise fall back to local minikube config
try {
    client = new Client({ config: config.getInCluster() });
    const loadConfig = async () => {
        await client.loadSpec();
    }
    loadConfig();
    console.log('Kube Config: in cluster');
} catch (e) {
    client = new Client({ config: config.fromKubeconfig(), version: '1.9' });
    console.log('Kube Config: out of cluster');
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

function getConfigMap() {
    return client.api.v1.namespaces('default')
        .configmaps('saas-customers')
        .get()
}

function getConfigMapMock() {
  return new Promise(function(resolve, reject) {
    const obj = {
      "an": '{"namespace": "an", "flavor": "small", "hubTimeout": "2", "dockerRegistry": "gcr.io", "dockerRepo": "gke-verification/blackducksoftware","hubVersion": "4.7.0","status": "processing","ip": ""}'
    }
    const wrapper = {'body': {'data': obj}};
    resolve(wrapper);
  })
}

function getHubHealthReport() {
//    For local dev, may want to try:
//    return got('http://35.226.186.70:15472/latestreport')
//    TODO: set this through a config map
    return got('http://cn-crd-controller:15472/latestreport')
}

function sum(nums) {
  return nums.reduce((b, a) => b + a, 0);
}

function mergeCustomersAndHealthReport(customers, healthReport) {
    const realData = {};
    for (var namespace in customers) {
        const hub = JSON.parse(customers[namespace]);
        if (namespace in healthReport.Hubs) {
            const derived = healthReport.Hubs[namespace].Derived;
            hub["totalContainerRestartCount"] = sum(Object.keys(derived.ContainerRestarts).map((k) => derived.ContainerRestarts[k]));
            hub["podsNotRunningCount"] = sum(Object.keys(derived.PodStatuses).map((k) => derived.PodStatuses[k].length));
            hub["badEventsCount"] = derived.Events.length;
        }
        realData[namespace] = hub;
    }
    return realData
}

app.get('/api/customers', (req, res) => {
    console.log(new Date());
    if (!tokenIsInvalid(req, res)) {
        Promise.all([getConfigMap(), getHubHealthReport()])
            .then((array) => {
              const customers = array[0].body.data;
                const hubHealth = JSON.parse(array[1].body);
                console.log("hub health -- " + JSON.stringify(Object.keys(hubHealth)));
                console.log('/api/customers - configmap received:' + JSON.stringify(customers) + "\n");
                const realData = mergeCustomersAndHealthReport(customers, hubHealth);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(realData));
            })
            .catch((error) => {
                console.log(error);
                res.status(500);
                res.send(error.toString());
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
                res.status(500);
                res.send(error.toString());
            })
    }
})

app.get('/api/sql-instances', (req, res) => {
    console.log(new Date());
    if (!tokenIsInvalid(req, res)) {
        authorize(function(authClient) {
          var request = {
            project: 'gke-verification',
            auth: authClient,
          };

          var handlePage = function(err, response) {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: 'SQL Instances failed to load, blame Google' });
            }

            const dbInstances = response.data.items.map((instance) => instance.name);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(dbInstances));
            // console.log('d', response.data.items);
            // if (!itemsPage) {
            //   return;
            // }
            // for (var i = 0; i < itemsPage.length; i++) {
            //   // TODO: Change code below to process each resource in `itemsPage`:
            //   console.log(JSON.stringify(itemsPage[i], null, 2));
            // }
            //
            // if (response.nextPageToken) {
            //   request.pageToken = response.nextPageToken;
            //   sqlAdmin.instances.list(request, handlePage);
            // }
          };

          sqlAdmin.instances.list(request, handlePage);
        });
    }
})

function authorize(callback) {
  google.auth.getApplicationDefault(function(err, authClient) {
    if (err) {
      console.error('authentication failed: ', err);
      return;
    }
    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      var scopes = ['https://www.googleapis.com/auth/cloud-platform'];
      authClient = authClient.createScoped(scopes);
    }
    callback(authClient);
  });
}
