import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

export interface TestStraat {
    gebruiker: string;
    project: string;
    teststraat: string;
}

export interface Dweet {
    thing: string;
    created: string;
    content: TestStraat;
}

export interface Dweets {
    this: string;
    by: string;
    the: string;
    with: Dweet[];
}


@Injectable({
    providedIn: 'root'
})
export class TeststraatService {

    uniqueId = 'asddfdgvee';

    constructor(private http: HttpClient) {
    }

    add(teststraat: TestStraat): Observable<Dweets> {
        const body = {'gebruiker': teststraat.gebruiker, 'project': teststraat.project, 'teststraat': teststraat.teststraat};
        return this.http
            .post<Dweets>(`https://dweet.io/dweet/for/${this.uniqueId}`, body);
    }

    getAll(): Observable<Dweets> {
        return this.http
            .get<Dweets>(`https://dweet.io/get/dweets/for/${this.uniqueId}`);
    }

}
