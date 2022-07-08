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

function main() {
  var argv = parseArgs(process.argv.slice(2));

  var target = [];
  if (argv._.length > 0) {
    target = argv._; 
  } else {
    target.push('localhost:50051');
  }

  let randomNumbers = generateRandomNumbers(500000)

  var client = new finder_proto.Finder(target[0],
                                       grpc.credentials.createInsecure());
  
  client.calculateMinMax({numbers: randomNumbers}, function(err, response) {
    console.log('Menor: ', response.min.toFixed(3), '\nMaior: ', response.max.toFixed(3));
  });
}

function generateRandomNumbers(qtd){
  return Array.from({length: qtd},(_, i) => Math.pow(1 - (Math.random()*qtd%qtd)/2, 2))
}

main();
