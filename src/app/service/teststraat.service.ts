import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface TestStraat {
    gebruiker: string;
    project: string;
    teststraat: string;
}

@Injectable({
    providedIn: 'root'
})
export class TeststraatService {
    testStraten: TestStraat[] = [];

    constructor(private http: HttpClient) {
    }

    add(teststraat: TestStraat): void {
        this.testStraten.push(teststraat);
    }

    getAll(): TestStraat[] {
        return this.testStraten;
    }

    removeAll(): TestStraat[] {
        this.testStraten = [];
        return this.testStraten;
    }
}
