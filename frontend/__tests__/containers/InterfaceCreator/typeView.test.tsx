import '@testing-library/jest-dom';
import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import {
  TypeView,
  formatFields,
  DraftsContext,
} from '../../../src/containers/InterfaceCreator/typeView';
import { render, fireEvent, act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('TypeView', () => {
  describe('formatFields', () => {
    it('formats fields', () => {
      const fields = {
        a: { name: 'a', type: 'string' },
        'b.c': { name: 'b.c', type: { fields: { d: { name: 'b.c.d', type: 'string' } } } },
      };
      const expected = {
        a: { name: 'a', type: 'string' },
        'b\\.c': {
          name: 'b.c',
          type: { fields: { 'b\\.c\\.d': { name: 'b.c.d', type: 'string' } } },
        },
      };
      expect(formatFields(fields)).toEqual(expected);
    });
  });

  describe('TypeView component', () => {
    it('renders fields and submits form', async () => {
      const initialData = {
        type: {
          path: 'some/path',
          target_dir: 'target/dir',
          target_file: 'target/file',
          typeinfo: {
            fields: {
              a: { name: 'a', type: 'string' },
              'b.c': { name: 'b.c', type: { fields: { d: { name: 'b.c.d', type: 'string' } } } },
            },
          },
        },
        fetchData: jest.fn().mockResolvedValue({ data: [] }),
        saveDraft: jest.fn(),
      };
      const setTypeReset = jest.fn();
      const onSubmitSuccess = jest.fn();
      render(
        <ReqoreUIProvider>
          <TypeView
            initialData={initialData}
            t={() => ''}
            setTypeReset={setTypeReset}
            onSubmitSuccess={onSubmitSuccess}
          />
        </ReqoreUIProvider>
      );

      expect(screen.getByLabelText('Path')).toHaveValue('some/path');
      expect(screen.getByLabelText('Target Directory')).toHaveValue('target/dir');
      expect(screen.getByLabelText('Target File')).toHaveValue('target/file');
      expect(screen.getByText('Fields')).toBeInTheDocument();
      expect(screen.getByText('Add Field')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();

      // Open add field modal
      userEvent.click(screen.getByText('Add Field'));
      expect(screen.getByText('Add Field')).toHaveAttribute('aria-expanded', 'true');

      // Fill in field name and type
      userEvent.type(screen.getByLabelText('Name'), 'newField');
      userEvent.click(screen.getByLabelText('Type'));
      userEvent.click(await screen.findByText('String'));

      // Add field
      userEvent.click(screen.getByText('Add'));
      expect(screen.queryByText('Add Field')).not.toBeInTheDocument();

      // Submit form
      userEvent.click(screen.getByText('Submit'));
      expect(onSubmitSuccess).toHaveBeenCalled();
      expect(initialData.saveDraft).toHaveBeenCalled();
    });
  });
});
