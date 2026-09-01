import React from 'react';
import ChatWindow from '../components/workspace/ChatWindow';
import ChatInput from '../components/workspace/ChatInput';

export const Workspace = () => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Central Chat View */}
      <ChatWindow />

      {/* Bottom Centered AI Command Bar */}
      <ChatInput />
    </div>
  );
};

export default Workspace;
