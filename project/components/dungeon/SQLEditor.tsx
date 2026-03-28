'use client'

import { useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { sql } from '@codemirror/lang-sql'
import { oneDark } from '@codemirror/theme-one-dark'
import { keymap } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'
import { EditorView } from '@codemirror/view'

interface Props {
  value:       string
  onChange:    (val: string) => void
  placeholder: string
  onRun:       () => void
}

export default function SQLEditor({ value, onChange, placeholder, onRun }: Props) {
  // Ctrl/Cmd + Enter to run
  const runKeymap = keymap.of([
    {
      key: 'Ctrl-Enter',
      run: () => { onRun(); return true },
    },
    {
      key: 'Mod-Enter',
      run: () => { onRun(); return true },
    },
  ])

  const theme = EditorView.theme({
    '&':                   { background: 'transparent !important', minHeight: '120px' },
    '.cm-content':         { padding: '10px', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.78rem', lineHeight: '1.8' },
    '.cm-placeholder':     { color: 'rgba(122,112,144,0.5)', fontStyle: 'italic' },
    '.cm-line':            { padding: '0' },
  })

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={[sql(), runKeymap, theme]}
      theme={oneDark}
      placeholder={placeholder}
      basicSetup={{
        lineNumbers:       true,
        highlightActiveLine: true,
        autocompletion:    true,
        indentOnInput:     true,
        tabSize:           2,
      }}
      style={{ fontSize: '0.78rem' }}
    />
  )
}
