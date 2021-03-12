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
  const fromUrl = "a";
  const toUrl = "b";

  const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(fromUrl));
  await contract.add({ key: hash, path: toUrl });
  const redirections = await contract.get({ key: hash });
  const expectedMessagesResult = [toUrl];
  expect(redirections).toEqual(expectedMessagesResult);
});

it('create two more redirections and expect three total', async () => {
  const fromUrl = "a";

  const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(fromUrl));
  await contract.add({ key: hash, path: "c" });
  await contract.add({ key: hash, path: "d" });

  const redirections = await contract.get({ key: hash });
  expect(redirections.length).toEqual(3);
});