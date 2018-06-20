# node-crd-lifecycle
Application for managing the full lifecycle of Kubernetes Custom Resource Definitions (CRD)

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites
* Install [Minikube](https://github.com/kubernetes/minikube) for spinning up a local Kubernetes cluster.
* This application uses the [Google Cloud SQL API](https://cloud.google.com/sql/docs/mysql/admin-api/) for provisioning in-cluster databases. Once authenticated, add your JSON file to `/var/secrets/google`.

### Install
```
git clone git@github.com:blackducksoftware/node-crd-lifecycle.git &&
npm install &&
cd client &&
npm install
```

### Development
1. Start up Minikube: `minikube start --vm-driver=virtualbox`
2. Start the server: `npm start`
3. Start the client: `cd client && npm start`
4. Fix the obvious errors you get related to namespaces, configmaps, etc by creating them in your cluster.

Hot reloading is enabled on both the client and server.
