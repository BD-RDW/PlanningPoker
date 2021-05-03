import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cards-view',
  templateUrl: './cards-view.component.html',
  styleUrls: ['./cards-view.component.css']
})
export class CardsViewComponent implements OnInit {

  @Output() cardSelectedEvent = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
    this.addCards();
  }

  public cardClicked(card: string): void {
    this.cardSelectedEvent.emit(card);
  }



  addCards(): void {
    let index = 2;
    let selectedCard = null;
    const cardNumbers = ['½', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', 'coffee'];
    const card1 = document.getElementById('card1');
    card1.addEventListener('click', () => {
        console.log('0');
    });
    cardNumbers.forEach(cn => {
        const card2 = card1.cloneNode(true);
        card2.addEventListener('click', (event) => {
            if (selectedCard) {
                selectedCard.getElementById('svgGroup').style.transform = 'translate(0, 0) scale(1)';
                selectedCard.getElementById('cardRect').style.fill = 'white';
            }
            selectedCard = event.target;
            selectedCard.getElementById('svgGroup').style.transform = 'translate(-10px, -14px) scale(1.15)';
            selectedCard.getElementById('cardRect').style.fill = 'url(#grad1)';
            this.cardClicked(cn);
        });
        let svgElem = card2.getElementById('svgGroup').firstChild;
        while (svgElem) {
            if ('text' === svgElem.nodeName) {
                svgElem.firstChild.data = cn;
            }
            svgElem = svgElem.nextSibling;
        }
        document.getElementById('cards').appendChild(card2);
        console.log('Index: %d', index);
        if (index % 5 === 0) {
          console.log('Added BR');
          document.getElementById('cards').appendChild(document.createElement('BR'));
        }
        index++;
    });
    }
}
