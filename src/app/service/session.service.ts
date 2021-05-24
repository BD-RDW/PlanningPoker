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
  private session: Session;

  constructor(private http: HttpClient) { }

  sessionCreate(username: string, sessionType: string): Observable<Session> {
    const body = { username, type: sessionType };
    return this.http.post<Session>(this.sessionUrl, body)
    .pipe(
      map( session => {
        this.session = session;
        return  session;
      }),
       catchError(this.handleError<boolean>('equipment', false)));
  }
  joinSession(sessionId: string, username: string): Observable<Session> {
    return this.http.post<Session>(`${this.sessionUrl}/${sessionId}`, { username })
    .pipe(
      map( session => {
        this.session = session;
        return  session;
      }),
       catchError(this.handleError<boolean>('joinSession', false)));
  }

  getSession(): Session {
    return this.session;
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
