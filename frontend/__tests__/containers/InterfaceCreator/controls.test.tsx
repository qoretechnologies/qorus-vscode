import '@testing-library/jest-dom';
import { PositiveColorEffect, SaveColorEffect } from '../../../src/components/Field/multiPair';
import {
  backControl,
  cancelControl,
  nextControl,
  resetControl,
  submitControl,
} from '../../../src/containers/InterfaceCreator/controls';

describe('Controls', () => {
  describe('cancelControl', () => {
    it('should create a cancel button with the correct label and icon', () => {
      const onClick = jest.fn();
      const control = cancelControl(onClick);
      expect(control.label).toEqual('Cancel');
      expect(control.icon).toEqual('CloseLine');
      expect(control.onClick).toEqual(onClick);
    });

    it('should accept other data to be added to the control object', () => {
      const onClick = jest.fn();
      const otherData = {
        disabled: true,
        customProp: 'customValue',
      };
      const control = cancelControl(onClick, otherData);
      expect(control.disabled).toEqual(true);
      expect(control.customProp).toEqual('customValue');
    });
  });

  describe('resetControl', () => {
    it('returns the correct object with default data', () => {
      const onClick = jest.fn();
      const expectedObject = {
        label: 'Reset',
        icon: 'HistoryLine',
        onClick,
      };
      expect(resetControl(onClick)).toEqual(expectedObject);
    });

    it('returns the correct object with additional data', () => {
      const onClick = jest.fn();
      const otherData = {
        someData: 'someValue',
      };
      const expectedObject = {
        label: 'Reset',
        icon: 'HistoryLine',
        onClick,
        ...otherData,
      };
      expect(resetControl(onClick, otherData)).toEqual(expectedObject);
    });
  });
  describe('backControl', () => {
    it('returns the correct object with default data', () => {
      const onClick = jest.fn();
      const expectedObject = {
        label: 'Back',
        icon: 'ArrowLeftLine',
        onClick,
      };
      expect(backControl(onClick)).toEqual(expectedObject);
    });

    it('returns the correct object with additional data', () => {
      const onClick = jest.fn();
      const otherData = {
        someData: 'someValue',
      };
      const expectedObject = {
        label: 'Back',
        icon: 'ArrowLeftLine',
        onClick,
        ...otherData,
      };
      expect(backControl(onClick, otherData)).toEqual(expectedObject);
    });
  });
  describe('nextControl', () => {
    it('should return the expected object with default values', () => {
      // arrange
      const onClick = jest.fn();

      // act
      const result = nextControl(onClick);

      // assert
      expect(result).toEqual({
        label: 'Next',
        icon: 'CheckLine',
        effect: PositiveColorEffect,
        position: 'right',
        onClick,
      });
    });

    it('should return the expected object with custom values', () => {
      // arrange
      const onClick = jest.fn();
      const otherData = { disabled: true };

      // act
      const result = nextControl(onClick, otherData);

      // assert
      expect(result).toEqual({
        label: 'Next',
        icon: 'CheckLine',
        effect: PositiveColorEffect,
        position: 'right',
        onClick,
        ...otherData,
      });
    });
  });

  describe('submitControl', () => {
    it('should return the expected object with default values', () => {
      // arrange
      const onClick = jest.fn();

      // act
      const result = submitControl(onClick);

      // assert
      expect(result).toEqual({
        label: 'Submit',
        icon: 'CheckDoubleLine',
        effect: SaveColorEffect,
        position: 'right',
        onClick,
      });
    });

    it('should return the expected object with custom values', () => {
      // arrange
      const onClick = jest.fn();
      const otherData = { disabled: true };

      // act
      const result = submitControl(onClick, otherData);

      // assert
      expect(result).toEqual({
        label: 'Submit',
        icon: 'CheckDoubleLine',
        effect: SaveColorEffect,
        position: 'right',
        onClick,
        ...otherData,
      });
    });
  });
});
