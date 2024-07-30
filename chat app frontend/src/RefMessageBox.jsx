import React, { forwardRef } from 'react';
import { MessageBox as OriginalMessageBox } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';

const ForwardedMessageBox = forwardRef((props, ref) => (
  <OriginalMessageBox {...props} ref={ref} />
));

export default ForwardedMessageBox;
