import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
  })
  export class CardService {
      private cards: string[] = [];
      public selectedCardId = new BehaviorSubject("");

      public register(cardId: string): Observable<string> {
        if (this.cards.filter(c => c === cardId).length !== 0) {
            throw new Error("Duplicate cardId. This card can not be registered");              
        }
        this.cards.push(cardId);
        return this.selectedCardId;
      }
      public selected(cardId: string): void {
          if (this.cards.filter(c => c === cardId).length !== 1) {
              throw new Error("Card not registered");              
          }
          this.selectedCardId.next(cardId);
      }
  }