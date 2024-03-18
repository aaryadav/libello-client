import { create } from 'zustand'

export const useNotebookState = create((set) => ({
  activeContainer: null,
  activeSession: {},
  updateContainer: (containerId) => set(() => ({ activeContainer: containerId })),
  updateSession: (sessionId, sessionName) => set(() => ({ activeSession: { id: sessionId, name: sessionName } })),
  sessionDetails: {
    kernelId: '',
    sessionId: '',
  },
  updateSessionDetails: (kernelId, sessionId) =>
    set(() => ({
      sessionDetails: { kernelId, sessionId }
    })),
  cells: [],
  setCells: (newCells) => set(() => ({ cells: newCells })),
  addCell: (index, cellType = 'code') => set((state) => {
    const newCell = {
      id: Date.now().toString(),
      type: cellType,
      text: '',
      outputs: [],
      isSelected: false,
      executionCount: null,
    };
    const newCells = [...state.cells];
    newCells.splice(index + 1, 0, newCell)
    return { cells: newCells };
  }),
  selectCell: (index) => set((state) => {
    let newCells = [...state.cells];
    newCells[index].isSelected = !newCells[index].isSelected;
    return { cells: newCells };
  }),
  deselectAll: () => set((state) => {
    state.cells.forEach(cell => cell.isSelected = false);
  }),
  removeCell: (index) => set((state) => ({
    cells: state.cells.filter((_, i) => i !== index)
  })),
  updateCellText: (index, newText) => set((state) => {
    let newCells = [...state.cells];
    newCells[index].text = newText;
    return { cells: newCells };
  }),
  updateCellOutput: (index, outputType, content) => set((state) => {
    let newCells = [...state.cells];
    let newOutput = {};

    if (outputType === 'stream') {
      newOutput = {
        output_type: 'stream',
        name: 'stdout',
        text: content,
      };
    } else if (outputType === 'display_data') {
      newOutput = {
        output_type: 'display_data',
        data: content,
      };
    }

    if (!newCells[index].outputs) {
      newCells[index].outputs = [];
    }
    newCells[index].outputs.push(newOutput);

    return { cells: newCells };
  }),
  clearCellOutput: (index) => set((state) => {
    let newCells = [...state.cells];
    newCells[index].output = [];
    return { cells: newCells }
  }),
  activeCellIndex: null,
  setActiveCell: (index) => set(() => ({ activeCellIndex: index })),
  selectedCellIndex: null,
  setSelectedCell: (index) => set(() => ({ selectedCellIndex: index })),
  clearSelectedCell: () => set(() => ({ selectedCellIndex: null })),
}))

export const useAppState = create((set) => ({
  isFileExplorerVisible: false,
  isChatWindowVisible: false,
  toggleFileExplorer: () => set((state) => ({ isFileExplorerVisible: !state.isFileExplorerVisible })),
  toggleChatWindow: () => set((state) => ({ isChatWindowVisible: !state.isChatWindowVisible })),
}));
