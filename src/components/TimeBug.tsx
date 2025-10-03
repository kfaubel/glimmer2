import React from 'react';
import { TimeBugProps, TimeBugLocation } from '../types';
import { TIME_BUG_CLASSES } from '../constants';
import { useCurrentTime } from '../hooks/useCurrentTime';

const TimeBug: React.FC<TimeBugProps> = ({ location }) => {
  const { formatTime } = useCurrentTime(60000); // Update every minute
  
  if (!location || !(location in TIME_BUG_CLASSES)) {
    return null;
  }

  const timeStr = formatTime('h:mm a');
  const className = `time-bug ${TIME_BUG_CLASSES[location as keyof typeof TIME_BUG_CLASSES]}`;

  return (
    <div id="time-bug" className={className}>
      {timeStr}
    </div>
  );
};

export default TimeBug;
