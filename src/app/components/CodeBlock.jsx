"use client"

import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { keymap } from '@codemirror/view';


import { useNotebookState, useAppState } from '../useStore.js';

const CodeBlock = ({ index, value, onChange }) => {
  const editorContainerRef = useRef(null);

  const { setActiveCell } = useNotebookState((state) => ({ setActiveCell: state.setActiveCell }));

  useEffect(() => {
    if (editorContainerRef.current) {
      const state = EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          python(),
          keymap.of([
            { key: 'Ctrl+Enter', run: false },
          ]),
          EditorView.updateListener.of(function (e) {
            const newValue = e.state.doc.toString();
            onChange(newValue);
          })],
      });

      const view = new EditorView({
        state,
        parent: editorContainerRef.current,
      });

      return () => {
        view.destroy();
      };
    }
  }, []);

  return (
    <div
      onClick={(e) => {
        setActiveCell(index)
        e.stopPropagation()
      }}
      ref={editorContainerRef}
    />
  )
};

export default CodeBlock;
