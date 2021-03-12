// these are made available by near-cli/test_environment
// note: do not remove the line below as it is needed for these tests
/* global nearlib, nearConfig */

import 'regenerator-runtime/runtime';
import * as ethers from 'ethers';

let near;
let contract;
let accountId;

beforeAll(async function() {
  near = await nearlib.connect(nearConfig);
  accountId = nearConfig.contractName;
  contract = await near.loadContract(nearConfig.contractName, {
    viewMethods: ['get'],
    changeMethods: ['add'],
    sender: accountId
  });
});

it('create one redirect and retrieve it', async () => {
  await contract.add({ key: "0x0", target: "a", message: "message" });
  const redirections = await contract.get({ key: "0x0" });
  const expectedMessagesResult = [{ targetURL: "a", message: "message" }];
  expect(redirections).toEqual(expectedMessagesResult);
});

it('create two more redirections and expect three total', async () => {
  await contract.add({ key: "0x0", target: "b", message: "message" });
  await contract.add({ key: "0x0", target: "c", message: "message" });

  const redirections = await contract.get({ key: "0x0" });
  expect(redirections.length).toEqual(3);
});