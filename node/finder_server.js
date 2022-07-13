/*
 *
 * Copyright 2015 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

var PROTO_PATH = __dirname + "/../protos/finder.proto";

var parseArgs = require("minimist");
var grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");
var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
var hello_proto = grpc.loadPackageDefinition(packageDefinition).finder;

const findMinMax = (numberList) => {
  var min = Infinity;
  var max = -Infinity;
  numberList.forEach((element) => {
    if (element < min) min = element;
    if (element > max) max = element;
  });
  return [min, max];
};

/**
 * Implements the CalculateMinMax RPC method.
 */
function calculateMinMax(call, callback) {
  console.log("Números recebidos com sucesso!");
  let minMax = findMinMax(call.request.numbers);
  callback(null, { min: minMax[0], max: minMax[1] });
}

/**
 * Starts an RPC server that receives requests for the Finder service at the
 * sample server port
 */
function main() {
  var argv = parseArgs(process.argv.slice(2));
  var ipPort;
  if (argv._[0]) ipPort = argv._[0];
  else ipPort = "127.0.0.1:50051";

  var server = new grpc.Server();
  server.addService(hello_proto.Finder.service, {
    calculateMinMax: calculateMinMax,
  });
  server.bindAsync(ipPort, grpc.ServerCredentials.createInsecure(), () => {
    server.start();
  });
}

main();
