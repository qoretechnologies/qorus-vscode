import { render, screen } from '@testing-library/react';
import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import {
  getCategoryColor,
  getStateCategory,
  getStateColor,
  StyledFSMState,
  calculateFontSize,
} from '../../../../src/containers/InterfaceCreator/fsm/state';

describe('FSMState tests', () => {
  describe('StyledFSMState component', () => {
    it('renders without error', () => {
      const { container } = render(
        <ReqoreUIProvider>
          <StyledFSMState />
        </ReqoreUIProvider>
      );
      expect(container).toBeDefined();
    });
    describe('getStateCategory function', () => {
      it('returns the correct category based on the state type', () => {
        expect(getStateCategory('mapper')).toBe('interfaces');
        expect(getStateCategory('connector')).toBe('interfaces');
        expect(getStateCategory('pipeline')).toBe('interfaces');
        expect(getStateCategory('fsm')).toBe('logic');
        expect(getStateCategory('block')).toBe('logic');
        expect(getStateCategory('if')).toBe('logic');
        expect(getStateCategory('apicall')).toBe('api');
        expect(getStateCategory('unknown')).toBe('other');
      });
    });

    describe('calculateFontSize function', () => {
      it('returns the correct font size', () => {
        expect(calculateFontSize('State')).toBeUndefined();
        expect(calculateFontSize('This is a very long state name')).toBe('12px');
      });
    });

    describe('getCategoryColor function', () => {
      it('returns the correct color based on the category', () => {
        expect(getCategoryColor('interfaces')).toBe('#e8970b');
        expect(getCategoryColor('logic')).toBe('#3b3b3b');
        expect(getCategoryColor('api')).toBe('#1914b0');
        expect(getCategoryColor('other')).toBe('#950ea1');
      });
    });
  });
});
