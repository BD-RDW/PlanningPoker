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
      let temp = cnt.find(c => c.label === u.vote);
      if (! temp) {
        temp = { label: u.vote, count: 0 };
        cnt.push(temp);
      }
      temp.count++;
    });
    const labels = cnt.map(c => c.label);
    const data = cnt.map(c => c.count);
    console.log(labels);
    data.forEach((d, i) => console.log(`data[${i}] = ${d}`));
    this.data.labels = labels;
    this.data.datasets[0].data = data;
    this.data.datasets[0].backgroundColor = this.colors;
    this.data.datasets[0].hoverBackgroundColor = this.colors;
  }

}

interface Counts {
  label: string;
  count: number;
}
