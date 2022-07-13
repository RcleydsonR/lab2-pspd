PREREQUISITES
-------------

- `node`: This requires Node 0.12.x or greater.

INSTALL
-------

   ```sh
   $ # Get the gRPC repository
   $ export REPO_ROOT=grpc # REPO root can be any directory of your choice
   $ git clone -b RELEASE_TAG_HERE https://github.com/grpc/grpc $REPO_ROOT
   $ cd $REPO_ROOT

   $ cd examples/node
   $ npm install
   ```

TRY IT!
-------

 - Run the server

   ```sh
   $ # from node directory
   $ node finder_server.js
   $ # or declaring ip and port
   $ node finder_server.js 127.0.0.1:50052
   ```

 - Run the client

   ```sh
   $ # from node directory (default listen to 127.0.0.1:50051)
   $ node finder_client.js
   $ # or listening to multiple servers
   $ node finder_client.js 127.0.0.1:50051 127.0.0.1:50052 127.0.0.1:50053
   ```

TUTORIAL
--------
You can find a more detailed tutorial in [gRPC Basics: Node.js][]

[Install gRPC Node]:../../src/node
[gRPC Basics: Node.js]:https://grpc.io/docs/languages/node/basics
