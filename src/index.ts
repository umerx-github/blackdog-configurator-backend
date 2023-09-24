import express from 'express';
const app = express();
const PROTOCOL = 'http';
const PORT = 80;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`Running on ${PROTOCOL}://${HOST}:${PORT}`);
});
