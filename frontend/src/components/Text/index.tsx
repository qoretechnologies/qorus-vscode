// @flow
import { ReqoreTree } from '@qoretechnologies/reqore';
import compose from 'recompose/compose';
import pure from 'recompose/onlyUpdateForKeys';
import ContentByType from '../ContentByType';
import Flex from '../Flex';

const Text = ({ text, hasAlerts, expanded, noControls }) =>
  text && typeof text === 'object' ? (
    <ReqoreTree data={text} showControls={!noControls} />
  ) : (
    <Flex flexFlow="row" title={text}>
      <div
        className={`text-component ${expanded && 'text-component-expanded'} ${
          hasAlerts && 'has-alerts'
        }`}
        title={text}
      >
        <ContentByType content={text} />
      </div>
    </Flex>
  );

export default compose(pure(['text', 'expanded', 'hasAlerts']))(Text);
