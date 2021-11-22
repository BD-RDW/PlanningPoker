import {Component, OnInit} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {of} from 'rxjs';
import {Dweet, Dweets, TestStraat, TeststraatService} from '../../service/teststraat.service';
import {caesarCipher} from '../../util/caesarCipher';

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

    testStraten: TestStraat[] = [];

    constructor(private testStratenService: TeststraatService) {
    }

    ngOnInit(): void {
        this.getTeststratenData();
    }


    private getTeststratenData(): void {
        this.testStratenService.getAll().subscribe(
            (data: Dweets) => {
                if (data.this === 'failed') {
                    this.testStraten = [];
                } else {
                    this.testStraten = [];
                    data.with.forEach((dweet: Dweet) => {
                        if (Object.keys(dweet.content).length !== 0) {
                            const teststraat = {
                                gebruiker: caesarCipher(dweet.content.gebruiker, 3, true),
                                project: caesarCipher(dweet.content.project, 3, true),
                                teststraat: caesarCipher(dweet.content.teststraat, 3, true)
                            } as TestStraat;
                            this.testStraten.push(teststraat);
                        }
                    });
                }
            },
            (error) => {console.log('error', error)}
        );
    }

    changeShowAdForm(): void {
        this.showAdReservationForm = of(true);
    }

    onSubmitAddTestStraat(): void {
        if (this.profileForm !== undefined
            && this.profileForm !== null
            && this.profileForm.value !== null) {
            this.showAdReservationForm = of(false);
            const teststraat = {
                gebruiker: caesarCipher(this.profileForm.value.gebruiker, 3),
                project: caesarCipher(this.profileForm.value.project, 3),
                teststraat: caesarCipher(this.profileForm.value.teststraat, 3)
            } as TestStraat;
            this.testStratenService.add(teststraat).subscribe(
                (data) => {
                    this.profileForm.reset();
                    this.getTeststratenData();
                },
                (error) => {
                    console.log('error...', error);
                }
            );

        }
    }
}
