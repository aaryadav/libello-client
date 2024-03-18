import axios from 'axios';
import { w3cwebsocket as WebSocket } from 'websocket';

function connector(url, token) {
    const headers = { Authorization: `token ${token}` };
    let session = axios.get(url, { headers }) 
    return session;
}

async function createSession(url, notebookName) {
    try {
        // GET request to obtain the _xsrf token
        const initialResponse = await axios.get(url, { withCredentials: true });
        const xsrfToken = initialResponse.headers['set-cookie'][0];

        if (!xsrfToken) {
            throw new Error("Missing _xsrf token. Cannot create session.");
        }

        // Include the _xsrf token in the POST request
        const response = await axios.post(
            `${url}api/sessions`,
            {
                kernel: { name: "python3" },
                name: notebookName,
                path: notebookName,
                type: "notebook",
            },
            {
                headers: { 'X-XSRFToken': xsrfToken },
            }
        );

        return response.data;
    } catch (error) {
        throw new Error(`Failed to create session: ${error.message}`);
    }
}

function addCell(data, source) {
    const cell = {
        cell_type: "code",
        id: "0",
        metadata: {},
        source: [source],
        outputs: [],
        execution_count: 0,
    };
    data.content.cells.push(cell);
    return data;
}


async function execCode(url, token, kernelId, sessionId, code) {
    const wsUrl = new URL(url);
    wsUrl.protocol = wsUrl.protocol.replace('http', 'ws');
    wsUrl.pathname = `/api/kernels/${kernelId}/channels?session_id=${sessionId}`;

    const headers = { Authorization: `token ${token}` };
    const ws = new WebSocket(wsUrl.href, [], null, headers);

    ws.onopen = () => {
        const codeMsgId = uuidv1();
        const codeMsg = {
            channel: "shell",
            content: { silent: false, code },
            header: { msg_id: codeMsgId, msg_type: "execute_request" },
            metadata: {},
            parent_header: {},
        };

        ws.send(JSON.stringify(codeMsg));
    };

    ws.onmessage = (message) => {
        const msg = JSON.parse(message.data);

        if (msg.msg_type === "stream") {
            console.log(msg.content.text);
        }

        if (msg.msg_type === "execute_reply") {
            ws.close();
        }
    };
}


function deleteSession(url, sessionId) {
    return axios.delete(`${url}api/sessions/${sessionId}`);
}

function shutdownServer(url) {
    axios.post(`${url}api/shutdown`).then(() => {
        axios.get(url).catch((error) => {
            if (error.message.includes('Network Error')) {
                console.log("Server has been successfully shutdown!");
            }
        });
    });
}

function listDir(url) {
    return axios.get(`${url}api/contents/`).then(res => res.data.content);
}

function listDirNames(url) {
    return axios.get(`${url}api/contents/`).then(res => res.data.content.map(item => item.name));
}

function listSessions(url) {
    return axios.get(`${url}api/sessions`).then(res => res.data);
}

function listSpecs(url) {
    return axios.get(`${url}api/kernelspecs`).then(res => res.data);
}

function createNotebook(url) {
    return axios.post(`${url}api/contents/`, { type: "notebook" });
}

function renameNotebook(url, name, newName) {
    return axios.patch(`${url}api/contents/${name}`, { path: newName });
}

function deleteNotebook(url, name) {
    return axios.delete(`${url}api/contents/${name}`);
}

function getContents(url, name) {
    return axios.get(`${url}api/contents/${name}`).then(res => res.data);
}

const jupyterAPI = {
    connector,
    createSession,
    addCell,
    execCode,
    deleteSession,
    listDir,
    listDirNames,
    listSessions,
    listSpecs,
    createNotebook,
    renameNotebook,
    deleteNotebook,
    getContents,
};

export default jupyterAPI;