import axios from 'axios';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import Convert from 'ansi-to-html'
const convert = new Convert()

const runCode = async (containerId, accessToken, code) => {
    const url = 'http://localhost:8000/code';

        const request = {
            "container_id": containerId,
            "session_name": "string",
            "code": `${code}`
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
            onmessage(msg) {
                let rawData = JSON.parse(msg.data)["content"];
                if (Array.isArray(rawData)) {
                    rawData = rawData.map(ansiCode => convert.toHtml(ansiCode)).join("\n");
                }
                let htmlData = convert.toHtml(rawData);
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

export default runCode;