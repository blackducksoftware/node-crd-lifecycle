const express = require('express');
const app = express();
const path = require('path');
const got = require('got');
require('dotenv').config()
const { google } = require('googleapis');
const sqlAdmin = google.sqladmin('v1beta4');

const token = process.env.TOKEN;

// http server setup

app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'client', 'build', 'static')));

const tokenIsInvalid = (req, res) => {
    const rgbToken = req.get('rgb-token');
    console.log("server token is " + token + ";  request token is " + rgbToken);
    if (!rgbToken || rgbToken !== token) {
        return res.status(403).json({ error: 'Token is either null or invalid' });
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

app.listen(3001, () => console.log('Node server running on port 3001'))


// http client

// TODO read from config map
const baseUrl = "http://35.202.46.218:15472";
//const baseUrl = "http://cn-crd-controller:15472";
const urls = {
    "crudHub": `${baseUrl}/hub`,
    "getModel": `${baseUrl}/model`
};

function getModel() {
    return got(urls.getModel, { json: true });
}

function createHub(body) {
    return got.post(urls.crudHub, { json: true, body });
}

function deleteHub(body) {
    return got.delete(urls.crudHub, body);
}

// business logic

function sum(nums) {
  return nums.reduce((b, a) => b + a, 0);
}

function getPodsNotRunningCount(podStatuses) {
    const counts = Object.keys(podStatuses)
        .map(function (k) {
            if (k === "Running") {
                return 0;
            }
            return podStatuses[k].length;
        });
    return sum(counts);
}

//TODO: use reduce
function getBadEventsCount(events) {
  let total = 0;
  for (var key in events) {
    if (key !== "Running") {
      total += events[key];
    }
  }
  return total;
}

function flattenHubModel(model) {
    const derived = model.HealthReport.Derived;
    return {
        "namespace": model.namespace,
        "flavor": model.flavor,
        "hubTimeout": model.hubTimeout,
        "dockerRegistry": model.dockerRegistry,
        "dockerRepo": model.dockerRepo,
        "hubVersion": model.hubVersion,
        "status": model.status,
        "ip": model.ip,
        "dbPrototype": model.dbPrototype,
        "totalContainerRestartCount": sum(Object.keys(derived.ContainerRestarts).map((k) => derived.ContainerRestarts[k])),
        "podsNotRunningCount": getPodsNotRunningCount(derived.PodStatuses),
        "badEventsCount": getBadEventsCount(derived.Events.length)
    }
}

function flattenModel(model) {
  const body = {'nodes': model.Nodes};
  const hubs = {};
  for (hub in model.Hubs) {
    hubs[hub] = flattenHubModel(model.Hubs[hub]);
  }
  body.hubs = hubs;
  return body;
}

function getMockModel() {
    return new Promise((resolve) => { resolve(exampleData); });
}

// more routes for http server

app.get('/api/instances', (req, res) => {
    console.log(new Date());
    if (!tokenIsInvalid(req, res)) {
        getModel()
            .then((resp) => {
                res.setHeader('Content-Type', 'application/json');
                res.status(200);
                // res.send(JSON.stringify(resp.body));
                // TODO verify that resp.body is a json object, and that
                // res.send accepts a json object
                res.send(flattenModel(resp.body));
            })
            .catch((error) => {
                console.log(error);
                res.status(500);
                res.send(error.toString());
            })
    }
})

app.post('/api/instances', (req, res) => {
    if (!tokenIsInvalid(req, res)) {
        createHub(req.body)
            .then((resp) => {
                res.status(200);
                res.send('Hub instance created');
            })
            .catch((error) => {
                console.log(error);
                res.status(500);
                res.send(error.toString());
            })
    }
})

app.delete('/api/instances', (req, res) => {
    if (!tokenIsInvalid(req, res)) {
        deleteHub(req.body)
            .then((resp) => {
                res.status(200)
            })
            .catch((error) => {
                console.log(error);
                res.status(500);
                res.send(error.toString());
            })
    }
})

// TODO could/should these be pulled in from cn-crd-controller?
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
            //TODO: check for multiple pages
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

const exampleData = {
  "Hubs": {
    "abc123": {
      "namespace": "abc123",
      "flavor": "medium",
      "hubTimeout": "2",
      "dockerRegistry": "gcr.io",
      "dockerRepo": "gke-verification/blackducksoftware",
      "hubVersion": "4.7.0",
      "status": "processing",
      "ip": "",
      "dbPrototype": "",
      "HealthReport": {
        "BaseURL": null,
        "PodHealth": {},
        "MissingPods": null,
        "Version": null,
        "Events": [],
        "Errors": [
          "unable to find hub service in namespace abc123 (found 0 services)"
        ],
        "Derived": {
          "ContainerRestarts": {},
          "PodStatuses": {},
          "Events": {}
        }
      }
    },
    "opssight-demo": {
      "namespace": "opssight-demo",
      "flavor": "OpsSight",
      "hubTimeout": "never",
      "dockerRegistry": "gcr.io",
      "dockerRepo": "gke-verification/blackducksoftware",
      "hubVersion": "4.7.0",
      "status": "completed",
      "ip": "33.333.333.33",
      "dbPrototype": "",
      "HealthReport": {
        "BaseURL": "33.333.333.33",
        "PodHealth": {
          "cfssl-qblhl": {
            "Status": "Running",
            "ContainerReports": {
              "hub-cfssl": {
                "Restarts": 0,
                "Status": "running"
              }
            }
          },
          "hub-authentication-d6hkb": {
            "Status": "Running",
            "ContainerReports": {
              "cloudsql-proxy": {
                "Restarts": 0,
                "Status": "running"
              },
              "hub-authentication": {
                "Restarts": 0,
                "Status": "running"
              }
            }
          },
          "hub-scan-4lkvf": {
            "Status": "Running",
            "ContainerReports": {
              "cloudsql-proxy": {
                "Restarts": 0,
                "Status": "running"
              },
              "hub-scan": {
                "Restarts": 0,
                "Status": "running"
              }
            }
          },
          "hub-scan-q8zj2": {
            "Status": "Running",
            "ContainerReports": {
              "cloudsql-proxy": {
                "Restarts": 0,
                "Status": "running"
              },
              "hub-scan": {
                "Restarts": 0,
                "Status": "running"
              }
            }
          },
          "hub-scan-wvmj6": {
            "Status": "Running",
            "ContainerReports": {
              "cloudsql-proxy": {
                "Restarts": 0,
                "Status": "running"
              },
              "hub-scan": {
                "Restarts": 0,
                "Status": "running"
              }
            }
          },
          "jobrunner-4lqfv": {
            "Status": "Running",
            "ContainerReports": {
              "cloudsql-proxy": {
                "Restarts": 0,
                "Status": "running"
              },
              "jobrunner": {
                "Restarts": 0,
                "Status": "running"
              }
            }
          },
          "jobrunner-8wzvf": {
            "Status": "Running",
            "ContainerReports": {
              "cloudsql-proxy": {
                "Restarts": 0,
                "Status": "running"
              },
              "jobrunner": {
                "Restarts": 0,
                "Status": "running"
              }
            }
          },
          "jobrunner-z94ts": {
            "Status": "Running",
            "ContainerReports": {
              "cloudsql-proxy": {
                "Restarts": 0,
                "Status": "running"
              },
              "jobrunner": {
                "Restarts": 0,
                "Status": "running"
              }
            }
          },
          "registration-rctxb": {
            "Status": "Running",
            "ContainerReports": {
              "registration": {
                "Restarts": 0,
                "Status": "running"
              }
            }
          },
          "solr-tfckv": {
            "Status": "Running",
            "ContainerReports": {
              "solr": {
                "Restarts": 0,
                "Status": "running"
              }
            }
          },
          "webapp-logstash-thsq9": {
            "Status": "Running",
            "ContainerReports": {
              "cloudsql-proxy": {
                "Restarts": 0,
                "Status": "running"
              },
              "logstash": {
                "Restarts": 0,
                "Status": "running"
              },
              "webapp": {
                "Restarts": 10,
                "Status": "running"
              }
            }
          },
          "webserver-nkxd2": {
            "Status": "Running",
            "ContainerReports": {
              "webserver": {
                "Restarts": 0,
                "Status": "running"
              }
            }
          },
          "zookeeper-mcz4p": {
            "Status": "Running",
            "ContainerReports": {
              "zookeeper": {
                "Restarts": 0,
                "Status": "running"
              }
            }
          }
        },
        "MissingPods": [],
        "Version": "4.7.0",
        "Events": [],
        "Errors": [],
        "Derived": {
          "ContainerRestarts": {
            "cfssl-qblhl": 0,
            "hub-authentication-d6hkb": 0,
            "hub-scan-4lkvf": 0,
            "hub-scan-q8zj2": 0,
            "hub-scan-wvmj6": 0,
            "jobrunner-4lqfv": 0,
            "jobrunner-8wzvf": 0,
            "jobrunner-z94ts": 0,
            "registration-rctxb": 0,
            "solr-tfckv": 0,
            "webapp-logstash-thsq9": 10,
            "webserver-nkxd2": 0,
            "zookeeper-mcz4p": 0
          },
          "PodStatuses": {
            "Running": [
              "jobrunner-z94ts",
              "webserver-nkxd2",
              "hub-scan-q8zj2",
              "hub-authentication-d6hkb",
              "hub-scan-4lkvf",
              "hub-scan-wvmj6",
              "jobrunner-4lqfv",
              "jobrunner-8wzvf",
              "registration-rctxb",
              "solr-tfckv",
              "cfssl-qblhl",
              "zookeeper-mcz4p",
              "webapp-logstash-thsq9"
            ]
          },
          "Events": {}
        }
      }
    }
  },
  "Nodes": {
    "gke-large-hub-cluster-big-nodes-0207a27c-0cjs": "Ready",
    "gke-large-hub-cluster-big-nodes-e7f9f0d7-2f7c": "Ready",
    "gke-large-hub-cluster-pool-1-a5c5d12b-hh1m": "Ready"
  }
};
