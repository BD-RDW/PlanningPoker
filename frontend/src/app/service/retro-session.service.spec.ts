import { TestBed } from '@angular/core/testing';
import { RetroSessionService } from './retro-session.service';
import { SessionService } from './session.service';
import { WebsocketService } from './websocket.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Role, SessionType, Session, User } from '../model/session';
import { of, throwError } from 'rxjs';
import { WsMessage } from '../model/message';
import { RetrospectiveColumnData, RetrospectiveNote, MoodboardStatus, MoodboardUpdate } from '../model/retrospective-data';
import { RetrospectiveColumnComponent } from '../components/retrospective-column/retrospective-column.component';

describe('RetroSessionService', () => {
  let service: RetroSessionService;
  let sessionServiceMock: SessionService;
  let websocketServiceMock: WebsocketService;
  // tslint:disable-next-line:max-line-length
  const testSession: Session = {id: 'abc', type: SessionType.RETROSPECTIVE, user: {id: 2, name: 'testUser', role: Role.ScrumMaster}, users: []};

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        WebsocketService,
        SessionService
      ]
    });
    service = TestBed.inject(RetroSessionService);
    sessionServiceMock = TestBed.inject(SessionService);
    websocketServiceMock = TestBed.inject(WebsocketService);
    spyOn(websocketServiceMock, 'send').and.callFake(() => console.log('SpyOn method websocketServiceMock.send()'));
    service.session = testSession;
    service.moodboardCounts = [0, 0, 0, 0, 0];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('an addMessage message should be sent correct', () => {
    service.addMessage('TestMessage');
    expect(websocketServiceMock.send).toHaveBeenCalled();
    // tslint:disable-next-line:max-line-length
    expect(websocketServiceMock.send).toHaveBeenCalledWith({ action: 'AddMessage', sessionId: 'abc', userId: 2, payload: 'TestMessage' });
  });

  it('a myMoodSelection message should be sent correct', () => {
    service.moodboardSelected = 1;
    service.showMoodboard = true;
    service.myMoodSelection(4);
    expect(websocketServiceMock.send).toHaveBeenCalled();
    // tslint:disable-next-line:max-line-length
    expect(websocketServiceMock.send).toHaveBeenCalledWith({ action: 'UpdateMoodboard', sessionId: 'abc', userId: 2, payload: {display: true, arraySize: 5, previousvalue: 1, currentValue: 4} });
    expect(service.moodboardSelected).toBe(4);
  });

  it('isAdmin is correct', () => {
    service.session.user.role = undefined;
    expect(service.isAdmin()).toBe(false);
    service.session.user.role = Role.ScrumMaster;
    expect(service.isAdmin()).toBe(true);
    service.session = {id: 'def', type: SessionType.RETROSPECTIVE, user: {id: 3, name: 'testUser2', role: Role.TeamMember}, users: []};
    expect(service.isAdmin()).toBe(false);
  });

  it('mergeNotes message is sent correct', () => {
    const n2m = {baseNoteId: 1, note2MergeId: 5};
    service.mergeNotes(n2m);
    expect(websocketServiceMock.send).toHaveBeenCalled();
    // tslint:disable-next-line:max-line-length
    expect(websocketServiceMock.send).toHaveBeenCalledWith({ action: 'MergeNotes', sessionId: 'abc', userId: 2, payload:  n2m});
  });

  it('deleteNotes message is sent correct', () => {
    const note = { id: 5, col: 2, txt: undefined, userId: undefined, votes: 2};
    service.sendDeleteNote(note);
    expect(websocketServiceMock.send).toHaveBeenCalled();
    // tslint:disable-next-line:max-line-length
    expect(websocketServiceMock.send).toHaveBeenCalledWith({ action: 'DeleteNote', sessionId: 'abc', userId: 2, payload: note});
  });

  it('editNote message is sent correct', () => {
    const note = { id: 5, col: 2, txt: 'Test note text', userId: undefined, votes: 2};
    service.sendEditNote(note);
    expect(websocketServiceMock.send).toHaveBeenCalled();
    // tslint:disable-next-line:max-line-length
    expect(websocketServiceMock.send).toHaveBeenCalledWith({ action: 'EditNote', sessionId: 'abc', userId: 2, payload: note});
  });

  it('updateNote message is sent correct', () => {
    const note = { id: 2, col: 1, txt: 'Test note text', userId: undefined, votes: 2};
    service.sendUpdatedNote(note);
    expect(websocketServiceMock.send).toHaveBeenCalled();
    // tslint:disable-next-line:max-line-length
    expect(websocketServiceMock.send).toHaveBeenCalledWith({ action: 'UpdateNote', sessionId: 'abc', userId: 2, payload: note});
  });

  it('addNote message is sent correct', () => {
    const colNr = 2;
    service.addNote(colNr);
    expect(websocketServiceMock.send).toHaveBeenCalled();
    // tslint:disable-next-line:max-line-length
    expect(websocketServiceMock.send).toHaveBeenCalledWith({ action: 'AddNote', sessionId: 'abc', userId: 2, payload: colNr});
  });

  it('moodboardStatusUpdate message is sent correct', () => {
    const countSize = 2;
    const displayMoodboard = !service.showMoodboard;
    service.moodboardStatusUpdate(countSize);
    expect(websocketServiceMock.send).toHaveBeenCalled();
    // tslint:disable-next-line:max-line-length
    expect(websocketServiceMock.send).toHaveBeenCalledWith({ action: 'UpdateMoodboard', sessionId: 'abc', userId: 2, payload: {display: displayMoodboard, arraySize: countSize} });
  });

  it('voted message is sent correct', () => {
    const note: RetrospectiveNote = {id: 4, col: 5, txt: 'simple note txt'};
    service.voted(note);
    expect(websocketServiceMock.send).toHaveBeenCalled();
    // tslint:disable-next-line:max-line-length
    expect(websocketServiceMock.send).toHaveBeenCalledWith({ action: 'UpdateNote', sessionId: 'abc', userId: 2, payload:  note});
  });

  it('dragged message is stored correct', () => {
    const note: RetrospectiveNote = {id: 4, col: 5, txt: 'simple note txt'};
    service.setDraggedMessage(note);
    expect(service.draggedMessage).toEqual(note);
  });

  it('get the id of the message being dragged is correct', () => {
    const note: RetrospectiveNote = {id: 14, col: 15, txt: 'simple note txt'};
    service.setDraggedMessage(note);
    expect(service.draggedMessage).toEqual(note);
    expect(service.getDraggedMessageId()).toBe(14);
  });

  it('dragged message is correctly reset', () => {
    const note: RetrospectiveNote = {id: 4, col: 5, txt: 'simple note txt'};
    service.setDraggedMessage(note);
    expect(service.draggedMessage).toEqual(note);
    service.resetDraggedMessage();
    expect(service.draggedMessage).toBe(undefined);
    expect(service.getDraggedMessageId()).toBe(undefined);
  });

  // UpdateRetroSession, NewMessage, InitRetrospective, UpdateNote, DeleteNote, StatusMoodboard
  it('incomming message UpdateRetroSession is processed correct', () => {
    const users: User[] = [{id: 4, name: 'Jan', role: Role.TeamMember, vote: null}
      , {id: 2, name: 'testuser', role: Role.ScrumMaster, vote: null}
      , {id: 1, name: 'Piet', role: Role.TeamMember, vote: null}
      ];
    const sessionUsers = [{id: 4, name: 'Jan', role: Role.TeamMember, vote: null}
      , {id: 1, name: 'Piet', role: Role.TeamMember, vote: null}
      , {id: 2, name: 'testuser', role: Role.ScrumMaster, vote: null}];
    const message: WsMessage = {action: 'UpdateRetroSession', sessionId: 'XyZ', userId: 2, payload: users};
    service.session.user.role = undefined;
    service.processMessage(message);
    expect(service.session.users).toEqual(sessionUsers);
    expect(service.session.user.role).toEqual(Role.ScrumMaster);
  });

  // UpdateRetroSession, NewMessage, InitRetrospective, UpdateNote, DeleteNote, StatusMoodboard
  it('incomming message NewMessage is processed correct', () => {
    let index = 0;
    const resultTexts = ['Status...', 'Test chat message', 'Another chat message'];
    service.newMessage.subscribe(m => {
      expect(m).toBe(resultTexts[index++]);
    });
    service.processMessage({action: 'NewMessage', sessionId: 'XyZ', userId: 2, payload: 'Test chat message'});
    service.processMessage({action: 'NewMessage', sessionId: 'XyZ', userId: 2, payload: 'Another chat message'});
  });

  // UpdateRetroSession, NewMessage, InitRetrospective, UpdateNote, DeleteNote, StatusMoodboard
  it('incomming message InitRetrospective is processed correct', () => {
    const payload: RetrospectiveColumnData[] = [
      {column: 0, title: 'Column 1', notes: [
        {id: 5, col: 0, txt: 'Col 1 Txt 1', userId: undefined, votes: 0},
        {id: 7, col: 0, txt: 'Col 1 Txt 2', userId: undefined, votes: 1},
        {id: 15, col: 0, txt: 'Col 1 Txt 3', userId: undefined, votes: 0},
        ]
      },
      {column: 1, title: 'Column 2', notes: [
        {id: 15, col: 0, txt: 'Col 2 Txt 1', userId: undefined, votes: 0},
        {id: 17, col: 0, txt: 'Col 2 Txt 2', userId: undefined, votes: 0},
        {id: 25, col: 0, txt: 'Col 2 Txt 3', userId: undefined, votes: 0},
        ]
      },
      {column: 2, title: 'Column 3', notes: [
        {id: 25, col: 0, txt: 'Col 3 Txt 1', userId: undefined, votes: 0},
        {id: 27, col: 0, txt: 'Col 3 Txt 2', userId: undefined, votes: 0},
        {id: 35, col: 0, txt: 'Col 3 Txt 3', userId: undefined, votes: 1},
        ]
      },
    ];
    service.processMessage({action: 'InitRetrospective', sessionId: 'XyZ', userId: 2, payload});
  });

  // UpdateRetroSession, NewMessage, InitRetrospective, UpdateNote, DeleteNote, StatusMoodboard
  it('incomming message UpdateNote is processed correct', () => {
    const note: RetrospectiveNote = {id: 7, col: 4, txt: 'new text', userId: undefined, votes: undefined};
    service.columnData = [{column: 2, title: 'Col2', notes: [{id: 7, col: 2, txt: 'text7'}]},
    {column: 3, title: 'Col3', notes: [{id: 8, col: 3, txt: 'text8'}, {id: 13, col: 3, txt: 'text13'}, {id: 15, col: 3, txt: 'text15'}]},
    {column: 4, title: 'Col4', notes: [{id: 10, col: 4, txt: 'text10'}, {id: 7, col: 4, txt: 'text7'}, {id: 14, col: 4, txt: 'text14'}]}
    ];
    expect(service.columnData.length).toBe(3);
    expect(service.columnData[0].notes.length).toBe(1);
    expect(service.columnData[1].notes.length).toBe(3);
    expect(service.columnData[2].notes.length).toBe(3);
    expect(service.columnData[0].notes[0].txt).toBe('text7');
    expect(service.columnData[1].notes[0].txt).toBe('text8');
    expect(service.columnData[1].notes[1].txt).toBe('text13');
    expect(service.columnData[1].notes[2].txt).toBe('text15');
    expect(service.columnData[2].notes[0].txt).toBe('text10');
    expect(service.columnData[2].notes[1].txt).toBe('text7');
    expect(service.columnData[2].notes[2].txt).toBe('text14');
    service.processMessage({action: 'UpdateNote', sessionId: 'XyZ', userId: 2, payload: note});
    expect(service.columnData.length).toBe(3);
    expect(service.columnData[0].notes.length).toBe(1);
    expect(service.columnData[1].notes.length).toBe(3);
    expect(service.columnData[2].notes.length).toBe(3);
    expect(service.columnData[0].notes[0].txt).toBe('text7');
    expect(service.columnData[1].notes[0].txt).toBe('text8');
    expect(service.columnData[1].notes[1].txt).toBe('text13');
    expect(service.columnData[1].notes[2].txt).toBe('text15');
    expect(service.columnData[2].notes[0].txt).toBe('text10');
    expect(service.columnData[2].notes[1].txt).toBe('new text');
    expect(service.columnData[2].notes[2].txt).toBe('text14');
  });

  // UpdateRetroSession, NewMessage, InitRetrospective, UpdateNote, DeleteNote, StatusMoodboard
  it('incomming message DeleteNote is processed correct', () => {
    const note: RetrospectiveNote = {id: 7, col: 4, txt: 'new text'};
    service.columnData = [{column: 2, title: 'Col2', notes: [{id: 7, col: 2, txt: 'text7'}]},
    {column: 3, title: 'Col3', notes: [{id: 8, col: 3, txt: 'text8'}, {id: 13, col: 3, txt: 'text13'}, {id: 15, col: 3, txt: 'text15'}]},
    {column: 4, title: 'Col4', notes: [{id: 10, col: 4, txt: 'text10'}, {id: 7, col: 4, txt: 'text7'}, {id: 14, col: 4, txt: 'text14'}]}
    ];
    expect(service.columnData.length).toBe(3);
    expect(service.columnData[0].notes.length).toBe(1);
    expect(service.columnData[1].notes.length).toBe(3);
    expect(service.columnData[2].notes.length).toBe(3);
    expect(service.columnData[0].notes[0].txt).toBe('text7');
    expect(service.columnData[1].notes[0].txt).toBe('text8');
    expect(service.columnData[1].notes[1].txt).toBe('text13');
    expect(service.columnData[1].notes[2].txt).toBe('text15');
    expect(service.columnData[2].notes[0].txt).toBe('text10');
    expect(service.columnData[2].notes[1].txt).toBe('text7');
    expect(service.columnData[2].notes[2].txt).toBe('text14');
    service.processMessage({action: 'DeleteNote', sessionId: 'XyZ', userId: 2, payload: note});
    expect(service.columnData.length).toBe(3);
    expect(service.columnData[0].notes.length).toBe(1);
    expect(service.columnData[1].notes.length).toBe(3);
    expect(service.columnData[2].notes.length).toBe(2);
    expect(service.columnData[0].notes[0].txt).toBe('text7');
    expect(service.columnData[1].notes[0].txt).toBe('text8');
    expect(service.columnData[1].notes[1].txt).toBe('text13');
    expect(service.columnData[1].notes[2].txt).toBe('text15');
    expect(service.columnData[2].notes[0].txt).toBe('text10');
    expect(service.columnData[2].notes[1].txt).toBe('text14');
    note.col = 2;
    service.processMessage({action: 'DeleteNote', sessionId: 'XyZ', userId: 2, payload: note});
    expect(service.columnData.length).toBe(3);
    expect(service.columnData[0].notes.length).toBe(0);
    expect(service.columnData[1].notes.length).toBe(3);
    expect(service.columnData[2].notes.length).toBe(2);
    expect(service.columnData[1].notes[0].txt).toBe('text8');
    expect(service.columnData[1].notes[1].txt).toBe('text13');
    expect(service.columnData[1].notes[2].txt).toBe('text15');
    expect(service.columnData[2].notes[0].txt).toBe('text10');
    expect(service.columnData[2].notes[1].txt).toBe('text14');
  });

  // UpdateRetroSession, NewMessage, InitRetrospective, UpdateNote, DeleteNote, StatusMoodboard
  it('incomming message StatusMoodboard is processed correct', () => {
    const status: MoodboardStatus = {display: true, values: [5, 3, 1, 0]};
    service.showMoodboard = false;
    service.moodboardCounts = [];
    expect(service.showMoodboard).toBe(false);
    expect(service.moodboardCounts.length).toBe(0);
    service.processMessage({action: 'StatusMoodboard', sessionId: 'XyZ', userId: 2, payload: status});
    expect(service.showMoodboard).toBe(true);
    expect(service.moodboardCounts).toEqual([5, 3, 1, 0]);
    status.display = false;
    status.values = [10, 3];
    service.processMessage({action: 'StatusMoodboard', sessionId: 'XyZ', userId: 2, payload: status});
    expect(service.showMoodboard).toBe(false);
    expect(service.moodboardCounts).toEqual([10, 3]);
  });

  // UpdateRetroSession, NewMessage, InitRetrospective, UpdateNote, DeleteNote, StatusMoodboard
  it('incomming message XXXX is processed correct', () => {
    spyOn(window.console, 'log');
    service.processMessage({action: 'XXXX', sessionId: 'XyZ', userId: 2, payload: 'Test chat message'});
    expect(window.console.log).toHaveBeenCalled();
    expect(window.console.log).toHaveBeenCalledWith('RetroSessionComponent.processMessage: Unknown message action (XXXX) received.');
  });


  it('create session is correct', () => {
    const session =  {id: 'klm', type: SessionType.RETROSPECTIVE, user: {id: 15, name: 'user_05', role: Role.ScrumMaster}, users: [
      {id: 6, name: 'user_15', role: Role.TeamMember}, {id: 7, name: 'user_16', role: Role.TeamMember}
    ]};
    spyOn(sessionServiceMock, 'sessionCreate').and.callFake(() => of(session));
    spyOn(websocketServiceMock, 'init').and.callFake(() => of(session));
    service.createSession().subscribe(() => {
      expect(sessionServiceMock.sessionCreate).toHaveBeenCalled();
      // tslint:disable-next-line:max-line-length
      expect(sessionServiceMock.sessionCreate).toHaveBeenCalledWith('testUser', SessionType.RETROSPECTIVE);
      expect(service.inSession).toBe(true);
      expect(service.session).toEqual(session);
      expect(websocketServiceMock.init).toHaveBeenCalled();
      expect(websocketServiceMock.send).toHaveBeenCalled();
      // tslint:disable-next-line:max-line-length
      expect(websocketServiceMock.send).toHaveBeenCalledWith({ action: 'JoinSession', sessionId: 'klm', userId: 15, payload: 'Joining session klm' });
    });
  });

  it('create session fails', () => {
    console.log('create session fails');
    spyOn(sessionServiceMock, 'sessionCreate').and.callFake(() => throwError('404'));
    spyOn(websocketServiceMock, 'init').and.callFake(() => of(null));
    service.createSession().subscribe(() => {
      expect(sessionServiceMock.sessionCreate).toHaveBeenCalled();
      // tslint:disable-next-line:max-line-length
      expect(sessionServiceMock.sessionCreate).toHaveBeenCalledWith('testUser', SessionType.RETROSPECTIVE);
      expect(service.inSession).toBe(false);
      expect(service.session).toBe(undefined);
      expect(websocketServiceMock.init).not.toHaveBeenCalled();
      expect(websocketServiceMock.send).not.toHaveBeenCalled();
      // tslint:disable-next-line:max-line-length
      expect(websocketServiceMock.send).not.toHaveBeenCalledWith({ action: 'JoinSession', sessionId: 'klm', userId: 15, payload: 'Joining session klm' });
    });
  });

  it('join session fails', () => {
    console.log('join session fails');
    spyOn(sessionServiceMock, 'sessionCreate').and.callFake(() =>  throwError('404'));
    spyOn(websocketServiceMock, 'init').and.callFake(() => of(null));
    service.createSession().subscribe(() => {
      expect(sessionServiceMock.sessionCreate).toHaveBeenCalled();
      // tslint:disable-next-line:max-line-length
      expect(sessionServiceMock.sessionCreate).toHaveBeenCalledWith('testUser', SessionType.RETROSPECTIVE);
      expect(service.inSession).toBe(false);
      expect(service.session).toBe(undefined);
      expect(websocketServiceMock.init).not.toHaveBeenCalled();
      expect(websocketServiceMock.send).not.toHaveBeenCalled();
      // tslint:disable-next-line:max-line-length
      expect(websocketServiceMock.send).not.toHaveBeenCalledWith({ action: 'JoinSession', sessionId: 'zyx', userId: 5, payload: 'Joining session zyx' });
    });
  });

});

/*
export class RetroSessionService {

  constructor(private sessionService: SessionService,
              private websocketService: WebsocketService) { }

XX  public joinSession(): Observable<boolean> {
XX  public createSession(): Observable<boolean> {
X  public addMessage($event): void {
X  public moodboardStatusUpdate(countSize: number): void {
X  public voted($event): void {
X  public setDraggedMessage(message: RetrospectiveNote): void {
X  public getDraggedMessageId(): number {
X  public resetDraggedMessage(): void {
XXXXXXX  processMessage(message: WsMessage) => {
  X    case 'UpdateRetroSession': this.updateUserlist(message); break;
  X    case 'NewMessage': this.addNewMessage(message); break;
  X    case 'InitRetrospective': this.initRetrospective(message); break;
  X    case 'UpdateNote': this.updateNote(message); break;
  X    case 'DeleteNote': this.deleteNote(message); break;
  X    case 'StatusMoodboard': this.moodboardStatus(message); break;
  X    default: console.log(`RetroSessionComponent.processMessage: Unknown message action (${message.action}) received.`);
X  private moodboardStatus(message: WsMessage): void {
X  private updateUserlist(message: WsMessage): void {
X  private getUsersFromMessage(message: WsMessage): User[] {
X  private addNewMessage(message: WsMessage): void {
X  private initRetrospective(message: WsMessage): void {
X  private updateNote(message: WsMessage): void {
X  private deleteNote(message: WsMessage): void {
X  addNote(colId: number): void {
X  sendUpdatedNote(note: RetrospectiveNote): void {
X  sendEditNote(note: RetrospectiveNote): void {
X  sendDeleteNote(note: RetrospectiveNote): void {
X  mergeNotes(notes2Merge: NotesToMerge): void {
X  isAdmin(): boolean {
X  myMoodSelection(selection: number): void {

*/
