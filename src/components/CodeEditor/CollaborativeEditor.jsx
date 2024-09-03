import React, { useRef, useState, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { basicSetup } from 'codemirror';
import { EditorState, ChangeSet } from '@codemirror/state';
import {Update, rebaseUpdates} from "@codemirror/collab"

const CollaborativeEditor = ({
  documentContent,
  setDocumentContent,
  languageProg,
  theme,
  onHandleEditorChange,
  isConnected,
}) => {
  const editorRef = useRef(null);
  const [editorState, setEditorState] = useState(EditorState.create({
    doc: '',
    extensions: [basicSetup],
  }));

  const onChange = useCallback((value, viewUpdate) => {
    // `value` to aktualny tekst w edytorze
    // `viewUpdate` to obiekt z aktualizacją widoku

    if (viewUpdate.docChanged) {
      // Uzyskaj zmiany z viewUpdate.changes
      const changes = viewUpdate.changes;
      console.log('Changes:', changes);

      // Aktualizuj stan edytora
      setEditorState(viewUpdate.state);

      // Poniższe można wykorzystać do analizy wprowadzonej zmiany, 
      // ale upewnij się, że jest to poprawnie używane w kontekście
      // całego dokumentu. `ChangeSet` wymaga znajomości długości dokumentu.

      const changeSet = viewUpdate.state.changes;
      console.log('ChangeSet:', changeSet);
    }
  }, []);

  return (
    <CodeMirror
      value={editorState.doc.toString()}
      extensions={[basicSetup]}
      onChange={onChange}
    />
  );
};

export default CollaborativeEditor;
