import { getNameFromFields } from '../../src/hocomponents/withMethods';

describe('getNameFromFields function', () => {
  it('returns the name field value if it exists', () => {
    const data = [{ name: 'Name', value: 'John' }];
    const id = 1;
    const result = getNameFromFields(data, id);
    expect(result).toEqual('John');
  });

  it('returns "Method" + id if the name field does not exist', () => {
    const data = [{ name: 'Desc', value: 'A description' }];
    const id = 1;
    const result = getNameFromFields(data, id);
    expect(result).toEqual('Method 1');
  });
});
