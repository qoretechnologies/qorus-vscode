import '@testing-library/jest-dom';
import {
  getConditionType,
  isConditionValid,
  renderConditionField,
} from '../../../../src/containers/InterfaceCreator/fsm/transitionDialog';

describe('getConditionType function', () => {
  test('should return "none" if the condition is null or undefined', () => {
    expect(getConditionType(null)).toEqual('none');
    expect(getConditionType(undefined)).toEqual('none');
  });

  test('should return "connector" if the condition is an object with "class" and "connector" properties', () => {
    expect(getConditionType({ class: 'MyClass', connector: 'MyConnector' })).toEqual('connector');
  });

  test('should return "custom" for any other value', () => {
    expect(getConditionType('my custom condition')).toEqual('custom');
  });
});

describe('isConditionValid function', () => {
  test('should return true if the condition type is "none"', () => {
    expect(isConditionValid({ condition: null })).toEqual(true);
  });

  test('should return true if the condition type is "connector" and both "class" and "connector" properties are present', () => {
    expect(isConditionValid({ condition: { class: 'MyClass', connector: 'MyConnector' } })).toEqual(
      true
    );
  });

  test('should return true if the condition type is "custom" and the "condition" property is a valid string', () => {
    expect(isConditionValid({ condition: 'my custom condition' })).toEqual(true);
  });

  test('should return false if the condition type is "connector" and either "class" or "connector" property is missing', () => {
    expect(isConditionValid({ condition: { class: 'MyClass' } })).toEqual(false);
    expect(isConditionValid({ condition: { connector: 'MyConnector' } })).toEqual(false);
  });

  test('should return false if the condition type is "custom" and the "condition" property is an invalid string', () => {
    expect(isConditionValid({ condition: {} })).toEqual(false);
    expect(isConditionValid({ condition: 123 })).toEqual(false);
    expect(isConditionValid({ condition: '' })).toEqual(false);
  });
});

describe('renderConditionField function', () => {
  const onChange = jest.fn();

  test('should return null if the condition type is "none"', () => {
    expect(renderConditionField('none', {}, onChange)).toBeNull();
  });
});
