import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/model/session';

@Component({
  selector: 'app-result-view',
  templateUrl: './result-view.component.html',
  styleUrls: ['./result-view.component.css']
})
export class ResultViewComponent implements OnInit {

  @Input() users: User[];
  @Input() choices: string[];
  @Input() colors: string[];

  public data: any = {
    labels: [],
    datasets: [
        {
            data: [],
            backgroundColor: [],
            hoverBackgroundColor: []
        }]
    };

  constructor() { }

  ngOnInit(): void {
    const cnt: Counts[] = [];
    this.users.forEach(u => {
      let temp = cnt.find(c => c.value === u.vote);
      if (! temp) {
        temp = { value: u.vote, label: u.vote + ' SP', count: 0 };
        cnt.push(temp);
      }
      temp.count++;
    });

    const labels = cnt.map(c => c.label + ` (${c.count}x)`);
    const data = cnt.map(c => c.count);
    this.data.labels = labels;
    this.data.datasets[0].label = 'cnt';
    this.data.datasets[0].data = data;
    this.data.datasets[0].backgroundColor = this.colors;
    this.data.datasets[0].hoverBackgroundColor = this.colors;
  }

}

interface Counts {
  value: string;
  label: string;
  count: number;
}
