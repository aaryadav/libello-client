"use client"

import { useFiefTokenInfo } from '@fief/fief/react';
import { fetchEventSource } from '@microsoft/fetch-event-source';

import { Button } from './ui/button'
import { useNotebookState } from '../useStore.js';
import CodeBlock from './CodeBlock.jsx';

import { JetBrains_Mono } from 'next/font/google';
import { Play, Plus, Minus } from 'lucide-react';

import Convert from 'ansi-to-html'
import { useEffect } from 'react';

const convert = new Convert()

const jbmono = JetBrains_Mono({ subsets: ['latin'] })

const Playground = () => {
    const tokenInfo = useFiefTokenInfo();

    const { cells, addCell, removeCell, updateCellText, updateCellOutput, selectCell, setActiveCell,
        activeContainer, clearCellOutput, sessionDetails
    } = useNotebookState((state) => ({
        cells: state.cells,
        addCell: state.addCell,
        removeCell: state.removeCell,
        updateCellText: state.updateCellText,
        updateCellOutput: state.updateCellOutput,
        selectCell: state.selectCell,
        setActiveCell: state.setActiveCell,
        activeContainer: state.activeContainer,
        clearCellOutput: state.clearCellOutput,
        sessionDetails: state.sessionDetails,
    }));

    const handleCode = (index, newVal) => {
        updateCellText(index, newVal);
    };
    const handleSelectCell = (index) => {
        selectCell(index);
        setActiveCell(index); setActiveCell
    };

    const handleRunCode = async (index, code) => {
        if (!tokenInfo || !tokenInfo.access_token) {
            setbuttonMsg("Bruh");
            return;
        }

        let accessToken = tokenInfo.access_token
        clearCellOutput(index)

        const containerId = activeContainer;
        const url = 'http://localhost:8000/execute-code';

        const request = {
            container_id: containerId,
            kernel_id: sessionDetails.kernelId,
            session_id: sessionDetails.sessionId,
            code: code
        }

        const fetchES = await fetchEventSource(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request),
            onopen(res) {
                if (res.ok && res.status === 200) {
                    console.log("Connection made ", res);
                } else if (
                    res.status >= 400 &&
                    res.status < 500 &&
                    res.status !== 429
                ) {
                    console.log("Client side error ", res);
                }
            },
            // onmessage(msg) {
            //     let data = JSON.parse(msg.data);
            //     let contentType = data.type;
            //     let content = data.content;

            //     if (contentType === 'image') {
            //         content = `data:image/png;base64,${content}`;
            //     }
            //     updateCellOutput(index, contentType, content);
            // },
            onmessage(msg) {
                let data = JSON.parse(msg.data);
                let contentType = data.type;
                let content = data.content;
                console.log(contentType)
                // Structure the output based on its type
                if (contentType === 'image') {
                    content = `data:image/png;base64,${content}`;
                    updateCellOutput(index, 'display_data', content);
                } else {
                    updateCellOutput(index, 'stream', content);
                }

            },

            onclose() {
                console.log("Connection closed by the server");
            },
            onerror(err) {
                console.log("There was an error from server", err);
            },
        })

        return () => {
            fetchES.close();
        };
    }

    useEffect(() => {
        console.log(cells)
    }, [cells])

    const renderCellOutpute = (cell) => {
        if (Array.isArray(cell.output)) {
            return cell.output.map((outputItem, idx) => {
                switch (outputItem.output_type) {
                    case 'stream':
                        return <div key={idx} dangerouslySetInnerHTML={{ __html: outputItem["text"] }} />;
                    case 'display_data':
                        return <img key={idx} src={outputItem.content} alt="Output" />;
                    default:
                        return <div key={idx} dangerouslySetInnerHTML={{ __html: outputItem["text"] }} />;
                }
            });
        }
        return null;
    }


    const renderCellOutput = (cell) => {
        if (Array.isArray(cell.outputs)) {
            return cell.outputs.map((outputItem, idx) => {
                switch (outputItem.output_type) {
                    case 'stream':
                        return <pre key={idx}>{outputItem['text']}</pre>;
                    case 'display_data':
                        return <img key={idx} src={outputItem.data} alt="Output" />;
                    default:
                        return <div key={idx}>Unsupported output type</div>;
                }
            });
        }
        return null;
    }

    return (
        <div className='cells space-y-2'>
            {cells.map((cell, index) => (
                <div key={cell.id} className='code-block w-fit relative'>
                    <div className={`cell ${jbmono.className} ml-[160px] mt-[40px]`}>
                        <div
                            className={`cell-marker ${cell.isSelected ? "bg-bigblue" : "bg-biggrey"}`}>
                        </div>
                        <div className='cell-input'
                            onClick={(e) => handleSelectCell(index)}
                        >
                            <CodeBlock
                                index={index}
                                value={cell.text}
                                onChange={(newVal) => handleCode(index, newVal)}
                            />
                        </div>
                        <pre>
                            <div className={`cell-output ${jbmono.className}`}>
                                {renderCellOutput(cell)}
                            </div>
                        </pre>
                        <div className="time-taken text-gray-200"></div>
                        <div className="run-btn">
                            <Button
                                onClick={() => { handleRunCode(index, cell.text) }}
                                className="rounded-full px-3 py-1 absolute -right-12 top-3">
                                <Play size={16} />
                            </Button>
                        </div>
                    </div>
                    <div className='cell-tools'>
                        <button className='cell-tool' onClick={(e) => addCell(index)}>
                            <Plus size={14} />&ensp;Code
                        </button>
                        <button className='cell-tool' onClick={(e) => removeCell(index)}>
                            <Minus size={14} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Playground;