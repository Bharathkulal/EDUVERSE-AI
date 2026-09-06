import React from 'react';
import toast from 'react-hot-toast';

export const NotificationEngine = {
  // Trigger multi-channel notifications when answer sheet is uploaded
  notifyStudentUploadSuccess(data) {
    const { subject, facultyName, pagesCount } = data;

    // 1. Interactive Toast using React.createElement for pure JS compatibility
    toast.custom((t) => (
      React.createElement('div', {
        className: `${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-[#111827]/95 backdrop-blur-xl shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-[#00f2fe]/40 p-4 border border-[#3b82f6]/30 text-white`
      }, [
        React.createElement('div', { key: 'body', className: 'flex-1 w-0 p-1' }, [
          React.createElement('div', { key: 'content', className: 'flex items-start' }, [
            React.createElement('div', { key: 'icon-wrap', className: 'flex-shrink-0 pt-0.5' }, [
              React.createElement('div', { key: 'icon', className: 'w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xl shadow-lg shadow-cyan-500/30' }, '📄')
            ]),
            React.createElement('div', { key: 'text-wrap', className: 'ml-3 flex-1' }, [
              React.createElement('p', { key: 'hdr', className: 'text-xs font-bold text-[#00f2fe] uppercase tracking-wider' }, 'Answer Sheet Uploaded'),
              React.createElement('p', { key: 'sub', className: 'text-sm font-semibold text-white mt-0.5' }, `${subject} Paper Received`),
              React.createElement('p', { key: 'desc', className: 'mt-1 text-xs text-gray-300' }, `Uploaded by ${facultyName} (${pagesCount} pages). Now available in Student Dashboard!`)
            ])
          ])
        ]),
        React.createElement('div', { key: 'close', className: 'flex border-l border-gray-700/60 pl-3 items-center' }, [
          React.createElement('button', {
            key: 'btn',
            onClick: () => toast.dismiss(t.id),
            className: 'w-full border border-transparent rounded-lg p-1.5 flex items-center justify-center text-xs font-medium text-gray-400 hover:text-white focus:outline-none'
          }, 'Dismiss')
        ])
      ])
    ), { duration: 6000 });

    // 2. Simulated Web Notification Alert
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`EduVerse AI: Answer Sheet Published`, {
        body: `Your ${subject} answer paper (${pagesCount} pages) was verified and published.`,
        icon: '/favicon.ico'
      });
    }

    return {
      channels: ['In-App Toast', 'Student Dashboard Alert', 'Simulated Email', 'Push Notification'],
      sentAt: new Date().toISOString()
    };
  }
};
