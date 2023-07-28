import * as axios from "axios";

export const test = async () => {
    let timestamp = Date.now();
    await axios.default.post('/api/ping', 'a'.repeat(256), {
        headers: {
            "Content-Type": 'text/plain'
        }
    });
    return Date.now() - timestamp;
}
