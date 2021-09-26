import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Session, SessionType } from '../model/session';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessionUrl = '/rest/session';

  constructor(private http: HttpClient) { }

  sessionCreate(username: string, sessionType: SessionType): Observable<Session> {
    const body = { name: username, type: sessionType };
    return this.http.post<SessionResponse>(this.sessionUrl, body)
    .pipe(
      map( postResponse => {
        // tslint:disable-next-line:max-line-length
        return  {id: postResponse.sessionId, type: sessionType, user: {id: postResponse.userId, name: username, role: null }, users: [] } as Session;
      }),
       catchError(this.handleError<boolean>('sessionCreate', false)));
  }
  joinSession(sessionType: SessionType, sessionId: string, username: string): Observable<Session> {
    return this.http.post<SessionResponse>(`${this.sessionUrl}/${sessionId}`, { name: username, sessionType })
    .pipe(
      map( postResponse => {
        // tslint:disable-next-line:max-line-length
        return  {id: postResponse.sessionId, type: sessionType, user: {id: postResponse.userId, name: username, role: null }, users: [] } as Session;
      }),
       catchError(this.handleError<boolean>('joinSession', false)));
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
     private handleError<T>(operation = 'operation', result?: T): any {
      return (error: any): Observable<T> => {

        // TODO: send the error to remote logging infrastructure
        console.error(error);

        // TODO: better job of transforming error for user consumption
        console.log(`${operation} failed: ${error.message}`);

        // Let the app keep running by returning an empty result.
        return of(result as T);
      };
    }
  }
interface SessionResponse {
  sessionId: string;
  username; string;
  userId: number;
}
