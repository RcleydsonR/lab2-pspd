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

var PROTO_PATH = __dirname + '/../protos/finder.proto';

var parseArgs = require('minimist');
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
var finder_proto = grpc.loadPackageDefinition(packageDefinition).finder;

function generateRandomNumbers(qtd){
  return Array.from({length: qtd},(_, i) => Math.pow(1 - (Math.random()*qtd%qtd)/2, 2))
}

const distributedService = (client, numberList) => {
  var min = Infinity, max = -Infinity;
  var clientSize = client.length
  var initialNumberIndex = 0;

  indexBase = (NUMBERS_LENGTH / clientSize)
  var endNumberIndex = indexBase;
  
  client.forEach((c, index) => {
    if(index == clientSize - 1)
      endNumberIndex = (NUMBERS_LENGTH / clientSize) + (NUMBERS_LENGTH % clientSize)

    c.calculateMinMax({numbers: numberList.slice(initialNumberIndex. endNumberIndex)}, function(err, response) {
      if(response.min < min) min = response.min
      if(response.max > max) max = response.max
    });

    initialNumberIndex += endNumberIndex + 1;
    endNumberIndex+=indexBase
  });

  
  return {min: min, max: max}
}

function main() {
  var argv = parseArgs(process.argv.slice(2));

  var target = [];
  if (argv._.length > 0) {
    target = argv._; 
  } else {
    target.push('localhost:50051');
  }

  let randomNumbers = generateRandomNumbers(NUMBERS_LENGTH)

  var clientList = []
  clientList = target.map(ipPort => (new finder_proto.Finder(ipPort, grpc.credentials.createInsecure())))
  
  var result = distributedService(clientList, randomNumbers)
  console.log('Menor: ', result.min.toFixed(3), '\nMaior: ', result.max.toFixed(3));
}

main();
