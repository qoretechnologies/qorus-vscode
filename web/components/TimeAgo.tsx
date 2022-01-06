import timeago from 'epoch-timeago';
import { useState } from 'react';
import { useInterval } from 'react-use';

export const getIntervalDelay = (time: number): number => {
  // If the time is larger than one day
  if (Date.now() - time > 60000 * 60 * 24) {
    // update once a day
    return 60000 * 60 * 24;
  }
  // If the time is larger than one hour
  if (Date.now() - time > 60000 * 60) {
    // update once an hour
    return 60000 * 60;
  }

  // Otherwise update every 5 seconds
  return 5000;
};

export const TimeAgo = ({ time }: { time: number }) => {
  const [_lastUpdate, _setLastUpdate] = useState<number>(Date.now());

  useInterval(() => {
    _setLastUpdate(Date.now());
  }, getIntervalDelay(time));

  return timeago(time);
};
