import { SessionMgr } from './session';
import { Session } from './session';

export class ReportingService {
  private changed = false;

  constructor(private sessionMgr: SessionMgr) {
    this.initReporting();
  }

  public signalChanges(): void {
    this.changed = true;
  }

  private initReporting(): void {
    console.log('ReportingService.initReporting');
    setInterval(() => {
      if (this.changed) {
        this.changed = false;
        const now = new Date();
        console.log(`Reporting: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);
        console.log(`Currently there are ${this.sessionMgr.getAllSessions().length} sessions.`);
        this.sessionMgr.getAllSessions().forEach((s: Session, i: number) => {
          console.log(`${i} - ${s.id}, ${s.type}: number of users: ${s.users.length}`);
        });
      }
      }, 1800000);
    }
}
