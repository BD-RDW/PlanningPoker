import { Component, Input, OnInit} from '@angular/core';
import { CardService } from './card.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {

  @Input()
  cardId: string;

  selected = false;

  constructor(private cardService: CardService) { }

  ngOnInit(): void {
    this.cardService.register(this.cardId).subscribe(id => {
      this.selected = id === this.cardId
    });
  }
  processCardClicked(): void {
    this.cardService.selected(this.cardId);
  }
}
