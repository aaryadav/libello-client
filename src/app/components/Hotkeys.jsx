"use client"
import { useHotkeys } from '@mantine/hooks';
import { useAppState, useNotebookState } from '../useStore.js';

import runCode from '../../lib/client.js'

export const Hotkeys = () => {
    const { cells, addCell, removeCell, updateCellText, selectCell, deselectAll,
        activeCellIndex,
        selectedCellIndex,
        updateCellOutput,
    } = useNotebookState((state) => ({
        cells: state.cells,
        addCell: state.addCell,
        removeCell: state.removeCell,
        updateCellText: state.updateCellText,
        selectCell: state.selectCell,
        deselectAll: state.deselectAll,
        activeCellIndex: state.activeCellIndex,
        selectedCellIndex: state.selectedCellIndex,
        updateCellOutput: state.updateCellOutput,
    }));

    const { toggleFileExplorer, toggleChatWindow } = useAppState((state) => ({
        toggleFileExplorer: state.toggleFileExplorer,
        toggleChatWindow: state.toggleChatWindow,
    }))


    useHotkeys([
        ['b', () => {
            addCell(selectedCellIndex);
        }],
        ['Ctrl+Shift+Enter', () => {
            if (activeCellIndex != null) {
                let code = cells[activeCellIndex].text;
                let output = runCode(code);
                updateCellOutput(activeCellIndex, output);
            }
        }],
        // App Actions:
        ['Ctrl+B', () => {
            toggleFileExplorer()
        }],
        ['Ctrl+L', () => {
            toggleChatWindow()
        }]
    ]);

    return null;
}
