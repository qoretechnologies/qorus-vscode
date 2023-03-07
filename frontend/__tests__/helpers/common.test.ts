import { IField } from '../../src/components/FieldWrapper';
import { mapFieldsToGroups, maybeSendOnChangeEvent } from '../../src/helpers/common';
import { postMessage } from '../../src/hocomponents/withMessageHandler';

jest.mock('../../src/hocomponents/withMessageHandler', () => ({
  postMessage: jest.fn(),
}));

describe('maybeSendOnChangeEvent', () => {
  const field: IField = {
    name: 'field1',
    value: 'initial',
    on_change: 'action1',
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should not post a message if field.on_change is not defined', () => {
    const value = 'new-value';
    const type = 'some-type';
    const interfaceId = 'some-interface-id';
    const sendResponse = true;

    maybeSendOnChangeEvent(
      { name: 'field1', value: 'initial' },
      value,
      type,
      interfaceId,
      sendResponse
    );

    expect(postMessage).not.toHaveBeenCalled();
  });

  it('should post a message with a single action in field.on_change', () => {
    const value = 'new-value';
    const type = 'some-type';
    const interfaceId = 'some-interface-id';
    const sendResponse = true;

    maybeSendOnChangeEvent(field, value, type, interfaceId, sendResponse);

    expect(postMessage).toHaveBeenCalledWith('action1', {
      field1: 'new-value',
      orig_field1: 'initial',
      iface_kind: 'some-type',
      iface_id: 'some-interface-id',
      send_response: true,
    });
  });

  it('should post messages with multiple actions in field.on_change', () => {
    const value = 'new-value';
    const type = 'some-type';
    const interfaceId = 'some-interface-id';
    const sendResponse = false;

    maybeSendOnChangeEvent(
      { ...field, on_change: ['action1', 'action2'] },
      value,
      type,
      interfaceId,
      sendResponse
    );

    expect(postMessage).toHaveBeenCalledWith('action1', {
      field1: 'new-value',
      orig_field1: 'initial',
      iface_kind: 'some-type',
      iface_id: 'some-interface-id',
      send_response: false,
    });

    expect(postMessage).toHaveBeenCalledWith('action2', {
      field1: 'new-value',
      orig_field1: 'initial',
      iface_kind: 'some-type',
      iface_id: 'some-interface-id',
      send_response: false,
    });
  });
});

describe('mapFieldsToGroups', () => {
  it('should group fields by their group property if specified', () => {
    const fields = [
      { name: 'field1', group: 'group1' },
      { name: 'field2', group: 'group1' },
      { name: 'field3', group: 'group2' },
      { name: 'field4' },
    ];

    const result = mapFieldsToGroups(fields);

    expect(result).toEqual({
      group1: [
        { name: 'field1', group: 'group1' },
        { name: 'field2', group: 'group1' },
      ],
      group2: [{ name: 'field3', group: 'group2' }],
      field4: [{ name: 'field4' }],
    });
  });

  it('should group fields by their name property if group property not specified', () => {
    const fields = [{ name: 'field1' }, { name: 'field2' }, { name: 'field3' }];

    const result = mapFieldsToGroups(fields);

    expect(result).toEqual({
      field1: [{ name: 'field1' }],
      field2: [{ name: 'field2' }],
      field3: [{ name: 'field3' }],
    });
  });
});
