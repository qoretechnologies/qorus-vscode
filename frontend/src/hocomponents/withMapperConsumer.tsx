import { pick } from 'lodash';
import { FunctionComponent } from 'react';
import { MapperContext } from '../context/mapper';

// A HoC helper that injects the fields data and functions
const withMapperConsumer =
  () =>
  (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => (
      <MapperContext.Consumer>
        {(fieldsData) => (
          <Component
            {...props}
            {...fieldsData}
            mapperData={pick(fieldsData, [
              'inputs',
              'contextInputs',
              'outputs',
              'inputProvider',
              'outputProvider',
              'relations',
              'inputChildren',
              'outputChildren',
              'inputRecord',
              'outputRecord',
              'inputOptionProvider',
              'outputOptionProvider',
              'mapperKeys',
              'hideInputSelector',
              'hideOutputSelector',
              'error',
              'isContextLoaded',
            ])}
          />
        )}
      </MapperContext.Consumer>
    );

    return EnhancedComponent;
  };

export default withMapperConsumer;
