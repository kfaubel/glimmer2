import React from 'react';

export interface MessageProps {
    message: string;
}

function Message(props: MessageProps) {
    return (
        <div
            id="message"
            className="message">
            {props.message}
        </div>
    );
}

export default Message;