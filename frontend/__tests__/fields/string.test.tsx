import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';

import { composeStories } from '@storybook/react';
import * as StringField from '../../src/stories/Fields/String.stories';

const { Default, CanBeNull } = composeStories(StringField);

test('<StringField> - renders a no value if can be null is false', () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <CanBeNull
        {...CanBeNull.args}
        onChange={onChange}
        name="test"
        value={null}
        canBeNull={false}
      />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-control-group')).toBeTruthy();
  expect(onChange).toHaveBeenCalledWith('test', undefined);
});

test('<StringField> - renders a correct value with backend messages provided', async () => {
  const onChange = jest.fn();

  render(
    <ReqoreUIProvider>
      <Default
        get_message={{ action: 'string-test' }}
        return_message={{ action: 'string-test-response', return_value: 'importantValue' }}
        onChange={onChange}
        name="test"
      />
    </ReqoreUIProvider>
  );

  await new Promise((resolve) => setTimeout(resolve, 100));

  expect(onChange).toHaveBeenLastCalledWith('test', '1234');
});
