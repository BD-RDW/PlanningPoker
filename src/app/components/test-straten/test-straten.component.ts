import {Component, OnInit} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {of} from 'rxjs';
import {HttpClientModule} from '@angular/common/http';
import {TestStraat, TeststraatService} from '../../service/teststraat.service';

@Component({
    selector: 'app-test-straten',
    templateUrl: './test-straten.component.html',
    styleUrls: ['./test-straten.component.css']
})
export class TestStratenComponent implements OnInit {
    showAdReservationForm = of(false);
    profileForm = new FormGroup({
        gebruiker: new FormControl('', Validators.required),
        project: new FormControl('', Validators.required),
        teststraat: new FormControl('', Validators.required),
    });
    randomId = 'hjhdjdfdgv';
    savedTestStraten: TestStraat[] = [];

    constructor(private testStratenService: TeststraatService) {
    }

    ngOnInit(): void {

    }


    changeShowAdForm(): void {
        this.showAdReservationForm = of(true);
    }

    onSubmitAddTestStraat(): void {
        if (this.profileForm !== undefined
            && this.profileForm !== null
            && this.profileForm.value !== null) {

            console.log(this.profileForm.value);
            this.showAdReservationForm = of(false);
            console.log(this.showAdReservationForm);
            const teststraat = {
                gebruiker: this.profileForm.value.gebruiker,
                project: this.profileForm.value.project,
                teststraat: this.profileForm.value.teststraat
            } as TestStraat;
            this.testStratenService.add(teststraat);
            this.savedTestStraten.push(teststraat);
            this.profileForm.reset();
        }
    }
}
