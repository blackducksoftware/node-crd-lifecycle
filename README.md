To run:
```
(cd ./client/src && npm install && npm run build ); node index.js
```

For local dev:
- make sure your `kubectl` is configured to talk to a cluster.
- run the above command.
- fix the obvious errors you get related to namespaces, configmaps, etc by creating them in your cluster.
