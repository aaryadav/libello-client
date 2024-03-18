"use client"

import { useState } from 'react';
import { useAppState, useNotebookState, useStore } from '../useStore.js';
import { useFiefTokenInfo } from '@fief/fief/react';
import { Menu, Bot, Plus, Play, Save } from 'lucide-react';
import axios from 'axios';

const Header = () => {
    let [buttonMsg, setbuttonMsg] = useState("Start Session");

    const { cells, addCell, removeCell, updateCellText, selectCell,
        setActiveCell,
        updateContainer,
        activeContainer,
        activeSession,
        updateSessionDetails,
    } = useNotebookState((state) => ({
        cells: state.cells,
        addCell: state.addCell,
        removeCell: state.removeCell,
        updateCellText: state.updateCellText,
        selectCell: state.selectCell,
        deselectAll: state.deselectAll,
        setActiveCell: state.setActiveCell,
        activeContainer: state.activeContainer,
        updateContainer: state.updateContainer,
        updateSessionDetails: state.updateSessionDetails,
        activeSession: state.activeSession
    }));

    const { toggleFileExplorer, toggleChatWindow } = useAppState((state) => ({
        toggleFileExplorer: state.toggleFileExplorer,
        toggleChatWindow: state.toggleChatWindow,
    }))

    const handleCode = (index, newVal) => {
        updateCellText(index, newVal);
    };
    const handleSelectCell = (index) => {
        selectCell(index);
        setActiveCell(index); setActiveCell
    };

    const tokenInfo = useFiefTokenInfo();

    // const startSession = async (projectName, dependencies) => {
    //     if (!tokenInfo || !tokenInfo.access_token) {
    //         setbuttonMsg("Bruh");
    //         return;
    //     }
    //     let access_token = tokenInfo.access_token

    //     setbuttonMsg("Connecting...")
    //     const url = 'http://localhost:8000/create-project';

    //     const request = {
    //         "project_name": projectName,
    //         "project_dependencies": dependencies
    //     }

    //     try {
    //         const session = await axios.post(url, request, {
    //             headers: {
    //                 Authorization: `Bearer ${access_token}`,
    //             }
    //         });
    //         const newContainer = session.data["container_id"];
    //         updateContainer(newContainer)
    //         setbuttonMsg("Connected!")
    //         addCell()
    //     } catch (error) {
    //         setbuttonMsg("Connnection Failed.")
    //         console.error('There was an error!', error);
    //     }

    // }

    const startSession = async (projectName, dependencies) => {
        if (!tokenInfo || !tokenInfo.access_token) {
            setbuttonMsg("Bruh");
            return;
        }
        let access_token = tokenInfo.access_token;

        setbuttonMsg("Connecting...");
        const projectUrl = 'http://localhost:8000/create-project';
        const sessionUrl = 'http://localhost:8000/create-session';

        const projectRequest = {
            "project_name": projectName,
            "project_dependencies": dependencies
        };

        try {
            // Create project
            const projectResponse = await axios.post(projectUrl, projectRequest, {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                }
            });
            const newContainerId = projectResponse.data["container_id"];

            console.log(newContainerId)
            // Create session
            const sessionRequest = {
                "container_id": newContainerId,
                "session_name": "aarya0"
            };

            console.log("ALll ok")
            const sessionResponse = await axios.post(sessionUrl, sessionRequest, {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                }
            });

            const { kernel_id, session_id } = sessionResponse.data;
            // Update state with new container and session details
            updateContainer(newContainerId);
            // You may need to add state management for session details
            updateSessionDetails(kernel_id, session_id);


            setbuttonMsg("Connected!");
            addCell();
        } catch (error) {
            setbuttonMsg("Connection Failed.");
            console.error('There was an error!', error);
        }
    }


    const formatCell = (cell) => {
        let cellType = cell.type === 'code' ? 'code' : 'markdown';
        let formattedCell = {
            cell_type: cellType,
            source: [cell.text],
            metadata: {},
        };

        if (cellType === 'code') {
            formattedCell['outputs'] = [];
            formattedCell['execution_count'] = cell.executionCount;

            cell.outputs.forEach(output => {
                if (output.output_type === 'stream') {
                    // For text outputs, add them to the 'outputs' array
                    formattedCell['outputs'].push({
                        name: output.name,
                        output_type: 'stream',
                        text: output.text
                    });
                } else if (output.output_type === 'display_data' && output.data['image/png']) {
                    // For image outputs, add a 'display_data' entry
                    formattedCell['outputs'].push({
                        output_type: 'display_data',
                        data: {
                            'image/png': output.data['image/png']
                        }
                    });
                }
            });
        }

        return formattedCell;
    };

    const generateNotebookJson = () => {
        let notebook = {
            metadata: {
                // Add necessary metadata here
                kernelspec: {
                    display_name: "Python 3",
                    language: "python",
                    name: "python3"
                },
            },
            nbformat: 4,
            nbformat_minor: 4,
            cells: cells.map(cell => formatCell(cell)),
        };

        return notebook;
    };

    const saveNotebook = async () => {
        let genNotebook = generateNotebookJson()
        console.log(genNotebook)
        updateNotebook(activeSession.id, genNotebook)
    }

    const updateNotebook = async (notebookId, content) => {
        if (!tokenInfo || !tokenInfo.access_token) {
            return;
        }
        let access_token = tokenInfo.access_token;

        const url = `http://localhost:8000/update-notebook/${notebookId}`;
        console.log(JSON.stringify(content))

        try {
            const response = await axios.put(url, { content: JSON.stringify(content) }, {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    'Content-Type': 'application/json'
                }
            });
            const updatedNotebook = response.data;
            console.log(updatedNotebook);
        } catch (error) {
            console.error('There was an error!', error);
        }
    };


    return (
        <div className="header border-b border-biggrey w-full flex items-center">
            <button className='toggle-btn left-6' onClick={toggleFileExplorer}>
                <Menu />
            </button>
            <button className='toggle-btn right-6' onClick={toggleChatWindow}>
                <Bot />
            </button>
            {activeSession.name &&
                <div>
                    <input className="session-name ml-20 px-2 py-1 border rounded"
                        value={activeSession.name} readOnly
                    />

                    <div className='toolbar flex ml-[400px] pt-4'>
                        <button className='toolbar-btn' onClick={() => startSession("MegaProject", [])}>
                            {buttonMsg}
                        </button>
                        <button className='toolbar-btn' onClick={(e) => addCell(cells.length)}>
                            <Plus size={16} />
                        </button>
                        <button className='toolbar-btn'>
                            <Play size={16} />
                        </button>
                        <button className='toolbar-btn'
                            onClick={() => { saveNotebook() }}
                        >
                            <Save size={16} />
                        </button>

                    </div>
                </div>

            }
        </div>
    )
}

export default Header;