"use client"
import React, { useState, useCallback, useDebugValue, useEffect } from 'react';
import { useFiefAuth, useFiefIsAuthenticated, useFiefUserinfo, useFiefTokenInfo } from '@fief/fief/react';
import axios from 'axios';

import { useNotebookState, useAppState } from '../useStore.js';
import { Button } from "./ui/button.jsx"
import { Hexagon, File } from 'lucide-react';
import Waffle from './Waffle.jsx'

const FileExplorer = () => {

    const { activeSession, updateSession, updateCellText, updateCellOutput, addCell, setCells } = useNotebookState((state) => ({
        activeSession: state.activeSession,
        updateSession: state.updateSession,
        updateCellText: state.updateCellText,
        updateCellOutput: state.updateCellOutput,
        addCell: state.addCell,
        setCells: state.setCells,
    }));

    const [files, setFiles] = useState([]);
    const fiefAuth = useFiefAuth();
    const isAuthenticated = useFiefIsAuthenticated();
    const tokenInfo = useFiefTokenInfo();
    const userinfo = useFiefUserinfo();

    const [showTextbox, setShowTextbox] = useState(false);
    const [notebookName, setNotebookName] = useState('');

    const login = useCallback(() => {
        const url = `${window.location.protocol}//${window.location.host}/callback`;
        fiefAuth.redirectToLogin(url);
    }, [fiefAuth]);

    const logout = useCallback(() => {
        fiefAuth.logout(`${window.location.protocol}//${window.location.host}`);
    }, [fiefAuth]);


    const saveNotebook = async () => {
        if (!notebookName) return;
        setShowTextbox(false);
        if (!tokenInfo || !tokenInfo.access_token) {
            return;
        }
        let access_token = tokenInfo.access_token

        const url = 'http://localhost:8000/notebook';

        const request = {
            "notebook_name": notebookName,
        }

        try {
            const session = await axios.post(url, request, {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                }
            });
            const newNotebook = session
            console.log(newNotebook)
        } catch (error) {
            console.error('There was an error!', error);
        }
    }

    const handleKeyDown = async (e) => {
        if (e.key === 'Enter') {
            await saveNotebook();
        }
    }
    const createNotebook = async () => {
        const randomName = Math.random().toString(36).substring(2, 7);
        setNotebookName(randomName);
        setShowTextbox(true);
    }

    const handleFile = async (fileId, fileName) => {
        if (!isAuthenticated) {
            return
        }
        let access_token = tokenInfo.access_token
        updateSession(fileId, fileName)

        const url = `http://localhost:8000/notebook/${fileId}`;

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                }
            });

            const notebookData = JSON.parse(response.data["file_content"]);
            const newCells = notebookData["cells"].map((cell, index) => {
                const cellId = Date.now().toString() + index; // Unique ID for each cell
                const cellText = cell["source"].join("\n"); // Joining all parts of the source

                let cellOutputs = [];

                if (cell["outputs"] && cell["outputs"].length > 0) {
                    cellOutputs = cell["outputs"].map((output) => {
                        if (output.output_type === 'stream') {
                            // Stream outputs contain 'text'
                            return {
                                output_type: 'stream',
                                name: 'stdout',
                                text: output["text"]
                            };
                        } else if (output.output_type === 'display_data' && output.data) {
                            const data = {};
                            if (output.data['image/png']) {
                                data['image/png'] = output.data['image/png'];
                            }
                            if (output.data['text/plain']) {
                                data['text/plain'] = output.data['text/plain'].join("");
                            }
                            return {
                                output_type: 'display_data',
                                data: data
                            };
                        }
                        return { output_type: 'unknown', data: {} };
                    });
                }
                return {
                    id: cellId,
                    type: 'code',
                    text: cellText,
                    outputs: cellOutputs,
                    isSelected: false,
                    executionCount: cell["execution_count"] || null,
                };
            });

            setCells(newCells);
        } catch (error) {
            console.error('There was an error!', error);
        }

    }

    useEffect(() => {
        const fetchData = async () => {
            if (!tokenInfo || !tokenInfo.access_token) {
                return;
            }
            let access_token = tokenInfo.access_token;
            let skip = 0;
            let limit = 10;
            const url = `http://localhost:8000/notebooks?skip=${skip}&limit=${limit}`;

            try {
                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    }
                });
                const notebooks = response.data;
                console.log(notebooks);
                setFiles(notebooks)
            } catch (error) {
                console.error('There was an error!', error);
            }
        };

        fetchData();
    }, [tokenInfo]);


    return (
        <div className="file-explorer h-full">
            <div className='flex space-x-2'>
                <div><Waffle /></div>
                <div>Waffle</div>
            </div>
            <div className="file-stack mt-8">
                <div className='text-sm'>Files</div>
                <Button className='text-xs'
                    onClick={() => { createNotebook() }}
                >
                    Create Notebook
                </Button>
                {showTextbox && (
                    <input
                        type="text"
                        value={notebookName}
                        onChange={(e) => setNotebookName(e.target.value)}
                        onBlur={() => setShowTextbox(false)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="file"
                    />
                )}
                {Array.isArray(files) && files.map(file => (
                    <div key={file.id} className="file"
                        onClick={() => { handleFile(file.id, file.name) }}
                    >
                        <File size={14} className='mr-2 flex-shrink-0' />
                        <div className='truncate text-ellipsis'>{file.name}</div>
                    </div>
                ))}

            </div>
            <div className="account fixed bottom-6 pt-6 border-t-2 border-gray-400 w-[180px]">
                {!isAuthenticated && <Button className="text-xs w-full" type="button" onClick={() => login()}>Login</Button>}
                {isAuthenticated && (
                    <div>
                        <div className='mb-3 px-2 rounded bg-outputgrey'>{userinfo.email}</div>
                        <Button className="text-xs" type="button" onClick={() => logout()}>Logout</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export { FileExplorer };
