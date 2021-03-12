// example here:
// https://github.com/near-examples/guest-book/blob/master/assembly/__tests__/guestbook.spec.ts

import { clear, add } from '../main';
import { VMContext, Context, u128 } from 'near-sdk-as';
import { map, keys } from '../model';

describe('test', () => {
  afterEach(() => {
    clear()
  });

  it('test', () => {
    expect(true).toBe(true);
  });

   it('adds a message', () => {
    const KEY = Uint8Array.wrap(String.UTF8.encode('0x0')) 
    add(KEY, 'ethernian.ner','https://twitter.com/ethernian');
    expect(keys.length).toBe(
      1,
      'should be exact one redirect key'
    );
    let ri = map.get(KEY)
    expect(ri).not.toBeNull('there should be an array')
    expect(ri!.length).toStrictEqual(
      1,
      'there should be exact one redirect in array"'
    );
  });

});