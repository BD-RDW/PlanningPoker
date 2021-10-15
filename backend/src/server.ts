import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path.js';
import * as http from 'http';
import { AddressInfo } from 'net';
import * as WebSocket from 'ws';
import { SessionMgr } from './session-manager';
import { Session, User, Role, SessionType } from './model/session';
import * as bodyParser from 'body-parser';
import { WsMessage } from './model/message';
import { RefinementSessionMgr } from './refinement-session-manager';
import { RetrospectiveSessionMgr } from './retrospective-session-manager';

const ENCODING_UTF8 = 'utf-8';
const HEADER_CONTENT_TYPE = 'Content-Type';
const CONTENT_TYPE_HTML = `text/html; charset=${ENCODING_UTF8}`;
const CONTENT_TYPE_JSON = `application/json; charset=${ENCODING_UTF8}`;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const sessionMgr = new SessionMgr();
const retroSessionMgr = new RetrospectiveSessionMgr(sessionMgr);
const refinementSessionMgr = new RefinementSessionMgr(sessionMgr);

const publicDir = '../public';

/* user joins existing session. */
app.post('/rest/session/:id', (req, res) => {
    if (sessionMgr.findSession(req.params.id)) {
        const session: Session = sessionMgr.findSession(req.params.id);
        if (session.type !== req.body.sessionType) {
            return res.status(400).send(`Session ${req.params.id} is not a ${req.body.sessionType} session.`);
        }
        const user: User = req.body;
        user.role = Role.TeamMember;
        user.id = sessionMgr.addUser(user, session);
        res.header(HEADER_CONTENT_TYPE, CONTENT_TYPE_JSON);
        return res.status(200).send({ id: session.id, type: session.type, user });
    }
    return res.sendStatus(404);
   });

/* Create a new session */
app.post('/rest/session', (req, res) => {
    const sessionType = req.body.type;
    if (sessionType !== SessionType.RETROSPECTIVE && sessionType !== SessionType.REFINEMENT) {
        res.status(500).send(`Unable to create a session of type ${req.params.type}`);
    }

    const user: User = { id: undefined, name: req.body.name, role: Role.ScrumMaster };
    const sessionId = sessionMgr.newSession(sessionType, user);
    res.header(HEADER_CONTENT_TYPE, CONTENT_TYPE_JSON);
    res.send({ id: sessionId, type: sessionType,  user } );
   });

/* get all sessions */
app.get('/rest/sessions', (req, res) => {

    res.header(HEADER_CONTENT_TYPE, CONTENT_TYPE_JSON);
    res.send(sessionMgr.getAllSessionsAsString());
   });
/* get all sessions */
app.delete('/rest/session/:sessionId', (req, res) => {
    if (sessionMgr.findSession(req.params.sessionId)) {
        switch (sessionMgr.findSession(req.params.sessionId).type) {
            case SessionType.RETROSPECTIVE : retroSessionMgr.deleteSession(req.params.sessionId); return res.status(204).send(); break;
            case SessionType.REFINEMENT : refinementSessionMgr.deleteSession(req.params.sessionId); return res.status(204).send(); break;
        }
        return res.status(404).send(`Unknown session type (${sessionMgr.findSession(req.params.sessionId).type}) in session ${sessionMgr.findSession(req.params.sessionId)}`);
    }
    res.status(404).send(`Unknown session ${sessionMgr.findSession(req.params.sessionId)}`);
});

  // default path to serve up index.html (single page application)
app.get('/:filename', (req, res) => {
    let filename = req.params.filename;
    if (filename === 'home') { filename = 'index.html'; }
    fs.exists(path.join(__dirname, publicDir, filename), (exists) => {
        if (exists) {
            res.sendFile(path.join(__dirname, publicDir, filename));
        } else {
            res.status(404). send(`File ${req.params.filename} not found!!`);
        }
    });
  });
  // default path to serve up index.html (single page application)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, publicDir, 'index.html'));
  });
// initialize a simple http server
const server = http.createServer(app);

// initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {
    // connection is up, let's add a simple simple event
    // send immediatly a feedback to the incoming connection
    let wsMessage: WsMessage = { action: 'INIT', sessionId: '1', userId: 2, payload: 'Hi there, I am a WebSocket server'};
    ws.send(JSON.stringify(JSON.stringify(wsMessage)));

    ws.on('message', (messageTxt: string) => {
        const message: WsMessage = JSON.parse(messageTxt);
        if (message.action === 'ping') {
            ws.send(JSON.stringify({action: 'pong', sessionId: message.sessionId, userId: message.userId} as WsMessage));
        } else {
            const session: Session = sessionMgr.findSessionForUser(message.userId);
            if (! (session && session.type)) {
                wsMessage = {action: 'ERROR', payload: `Unable to join session request for user ${message.userId}`
                    , sessionId: message.sessionId, userId: message.userId};
                ws.send(JSON.stringify(wsMessage));
                console.log('ERROR: Unable to proces session for user: %s', message.userId);
                ws.close();
            }
            switch (session.type.toUpperCase()) {
                case SessionType.RETROSPECTIVE : retroSessionMgr.processWsMessage(message, ws); break;
                case SessionType.REFINEMENT : refinementSessionMgr.processWsMessage(message, ws); break;
                default: {
                    wsMessage = {action: 'ERROR', payload: `Unable to process session type ${session.type}`
                    , sessionId: message.sessionId, userId: message.userId};
                    ws.send(JSON.stringify(wsMessage));
                    console.log('ERROR: Unable to proces sessionType: %s', session. type);
                }
            }
        }
    });

});

// start our server
server.listen(process.env.PORT || 8080, () => {
    if (server && server.address()) {
        console.log(`Server started on port ${(server.address() as AddressInfo).port} :)`);
    }
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
  });
