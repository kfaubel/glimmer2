import React from 'react';
import { MessageProps } from '../types';

const Message: React.FC<MessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div id="message" className="message">
      {message}
    </div>
  );
};

export default Message;
