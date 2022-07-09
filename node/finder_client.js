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
const NUMBERS_LENGTH = 500000;

var PROTO_PATH = __dirname + "/../protos/finder.proto";

var parseArgs = require("minimist");
var grpc = require("@grpc/grpc-js");
const { Worker, isMainThread, parentPort } = require("worker_threads");
var protoLoader = require("@grpc/proto-loader");
var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
var finder_proto = grpc.loadPackageDefinition(packageDefinition).finder;

function generateRandomNumbers(qtd) {
  return Array.from({ length: qtd }, (_, i) =>
    Math.pow(1 - ((Math.random() * qtd) % qtd) / 2, 2)
  );
}

function distributedService(client, numberList) {
  var min = Infinity,
    max = -Infinity;
  var clientSize = client.length;
  var initialNumberIndex = 0;
  const final = [];
  let finishedWorkers = 0;

  indexBase = Math.floor(NUMBERS_LENGTH / clientSize);
  var endNumberIndex = indexBase;

  client.forEach((c, index) => {
    if (index == clientSize - 1) endNumberIndex = NUMBERS_LENGTH;

    const worker = new Worker(__filename);
    worker.once("message", (message) => {
      if (message.min < min) min = message.min;
      if (message.max > max) max = message.max;
      finishedWorkers++;
      if (finishedWorkers === clientSize)
        console.log("Menor: ", min.toFixed(3), "\nMaior: ", max.toFixed(3));
    });
    worker.on("error", console.error);
    console.log(
      `worker "${c}" inicio "${initialNumberIndex}" fim "${endNumberIndex}"`
    );

    worker.postMessage({
      ipPort: c,
      numbers: numberList.slice(initialNumberIndex, endNumberIndex),
    });

    initialNumberIndex = endNumberIndex + 1;
    endNumberIndex += indexBase;
  });
}

function main() {
  if (isMainThread) {
    var argv = parseArgs(process.argv.slice(2));

    var target = [];
    if (argv._.length > 0) {
      target = argv._;
    } else {
      target.push("localhost:50051");
    }

    const randomNumbers = generateRandomNumbers(NUMBERS_LENGTH);

    var result = distributedService(target, randomNumbers);

    // console.log(
    //   "Menor: ",
    //   result.min.toFixed(3),
    //   "\nMaior: ",
    //   result.max.toFixed(3)
    // );
  } else {
    parentPort.once("message", (message) => {
      const numbers = message.numbers;

      const client = new finder_proto.Finder(
        message.ipPort,
        grpc.credentials.createInsecure()
      );

      client.calculateMinMax(
        {
          numbers: numbers,
        },
        function (err, response) {
          parentPort.postMessage({ min: response.min, max: response.max });
        }
      );
    });
  }
}

main();
