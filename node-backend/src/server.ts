import * as express from 'express';
import * as http from 'http';
import { AddressInfo } from 'net';
import * as WebSocket from 'ws';
import { SessionMgr, Session, User, Role } from './session';
import * as bodyParser from 'body-parser';
import { Message } from './message';

const ENCODING_UTF8 = 'utf-8';
const HEADER_CONTENT_TYPE = 'Content-Type';
const CONTENT_TYPE_HTML = `text/html; charset=${ENCODING_UTF8}`;
const CONTENT_TYPE_JSON = `application/json; charset=${ENCODING_UTF8}`;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const sessionMgr = new SessionMgr();

/* user joins existing session. */
app.post('/rest/session/:id', (req, res) => {
    console.log('Request %o ', req.body);
    if (sessionMgr.findSession(req.params.id)) {
        const session: Session = sessionMgr.findSession(req.params.id);
        const user: User = req.body;
        user.role = Role.TeamMember;
        const userId = sessionMgr.addUser(user, session);
        console.log('User added to session %O', session);
        res.header(HEADER_CONTENT_TYPE, CONTENT_TYPE_JSON);
        return res.status(200).send({ sessionId: session.id, userId: user.id, username: user.username });
    }
    return res.sendStatus(404);
   });

/* Create a new session */
app.post('/rest/session', (req, res) => {
    console.log('Request %o ', req.body);
    const user: User = { id: undefined, username: req.body.username, role: Role.ScrumMaster };
    const sessionId = sessionMgr.newSession(user);
    console.log('New session created %O', sessionMgr.findSession(sessionId));
    res.header(HEADER_CONTENT_TYPE, CONTENT_TYPE_JSON);
    res.send({ sessionId, userId: user.id, username: user.username } );
   });

/* Create a new session */
app.get('/rest/session', (req, res) => {
    res.header(HEADER_CONTENT_TYPE, CONTENT_TYPE_JSON);
    res.status(200).send({ someProperty: 'prop'});
   });


// initialize a simple http server
const server = http.createServer(app);

// initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {
    // connection is up, let's add a simple simple event
    ws.on('message', (messageTxt: string) => {
        const message: Message = JSON.parse(messageTxt);
        console.log('received: %O, type %s', message, typeof message);
        const newMessage = processMessage(message);
        // log the received message and send it back to the client
    });

    // send immediatly a feedback to the incoming connection
    ws.send(JSON.stringify({ type: 'CONNECTION', action: 'INIT', sessionId: '1', userId: 2, payload: 'Hi there, I am a WebSocket server'}));

    function processMessage(message: Message): void {
        switch (message.type.toUpperCase()) {
            case 'SESSION' : processSessionMessage(message); break;
            default: ws.send({type: 'ERROR', action: 'ERROR', payload: `Unable to process message type ${message.type}`
                , sessionId: message.sessionId, userId: message.userId});
        }
    }
    function processSessionMessage(message: Message): void {
        const session = sessionMgr.findSessionForUser(message.userId);
        switch (message.action.toUpperCase()) {
            case 'JOIN' :
                sessionMgr.findUser(message.userId).conn = ws;
                session.users.forEach(u => {
                    if (u.conn) { u.conn.send(JSON.stringify(
                        {type: 'SESSION', action: 'UPDATE', sessionId: session.id, userId: u.id, session}
                        , skipFields));
                    }
                });
                break;
            case 'MESSAGE' :
                session.users.forEach(u => {
                    if (u.conn) {
                        const username = sessionMgr.findUser(message.userId).username;
                        u.conn.send(JSON.stringify(
                        {type: 'SESSION', action: 'MESSAGE', sessionId: session.id, userId: u.id, payload: `Message from ${username}: ${message.payload}`}
                        , skipFields));
                    }
                });
                break;
            case 'VOTE' :
                sessionMgr.findUser(message.userId).vote = message.payload;
                session.users.forEach(u => {
                    if (u.conn) { u.conn.send(JSON.stringify(
                        {type: 'SESSION', action: 'UPDATE', sessionId: session.id, userId: u.id, session}
                        , skipFields));
                    }
                });
                break;
            case 'PHASE' :
                session.phase = message.payload;
                if (message.payload === 'voting') { session.users.forEach(u => u.vote = undefined); }
                session.users.forEach(u => {
                    if (u.conn) { u.conn.send(JSON.stringify(
                        {type: 'SESSION', action: 'PHASE', sessionId: session.id, userId: u.id, session}
                        , skipFields));
                    }
                });
                break;
                default: ws.send({type: 'ERROR', action: 'ERROR', payload: `Unable to process action ${message.action} in message type ${message.type}`
            , sessionId: message.sessionId, userId: message.userId});
        }
    }
    function skipFields(k: any, v: any): any {
        if (k === 'conn') { return undefined; } return v;
    }
});

// start our server
server.listen(process.env.PORT || 8999, () => {
    if (server && server.address()) {
        console.log(`Server started on port ${(server.address() as AddressInfo).port} :)`);
    }
});


