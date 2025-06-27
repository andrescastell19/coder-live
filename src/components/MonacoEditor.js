import React from 'react';
import Editor from '@monaco-editor/react';

function MonacoEditor({
  value = '',
  language = 'javascript',
  readOnly = false,
  onChange,
  onRun,
  style = {},
}) {
  return (
    <div style={{ width: '100%', height: '70vh', ...style }}>
      <Editor
        height="70vh"
        defaultLanguage={language}
        value={value}
        onChange={v => onChange && onChange(v || '')}
        theme="vs-dark"
        options={{
          readOnly,
          automaticLayout: true,
        }}
      />
    </div>
  );
}

export default MonacoEditor;
