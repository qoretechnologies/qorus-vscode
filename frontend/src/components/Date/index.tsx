import React from 'react';
import pure from 'recompose/onlyUpdateForKeys';
import moment from 'moment';

import { DATE_FORMATS } from '../../constants/dates';

const DateComponent = ({ date, format: format = DATE_FORMATS.DISPLAY }) =>
    date ? <span>{moment(date).format(format)}</span> : <span />;

export default pure(['date', 'format'])(DateComponent);
