import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Session } from '../model/session';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessionUrl = '/rest/session';

  constructor(private http: HttpClient) { }

  sessionCreate(username: string): Observable<Session> {
    const body = { username };
    return this.http.post<Session>(`${this.sessionUrl}`, body)
    .pipe(
      map( session => {
        console.log('SessionId %s', session.sessionId);
        return  session;
      }),
       catchError(this.handleError<boolean>('equipment', false)));
  }
  joinSession(sessionId: string, username: string): Observable<Session> {
    console.log('User %s wants to join session %s', username, sessionId);
    return this.http.post<Session>(`${this.sessionUrl}/${sessionId}`, { username })
    .pipe(
      map( session => {
        console.log('joined Session %O', session);
        return  session;
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
    }}
