import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Subscription } from 'rxjs';
import { Individual, KaryotypicSex, Sex } from 'src/app/models/individual';
import { Phenopacket } from 'src/app/models/phenopacket';

@Component({
  selector: 'app-phenopacket',
  templateUrl: './phenopacket.component.html',
  styleUrls: ['./phenopacket.component.scss']
})
export class PhenopacketComponent implements OnInit {
  @Input()
  phenopacket: Phenopacket;

  @Output() onIdChanged = new EventEmitter<any>();
  @Output() onSexChanged = new EventEmitter<any>();
  @Output() onDobChanged = new EventEmitter<any>();

  phenoIdControl = new FormControl('', [Validators.required]);
  phenoSexControl = new FormControl('', [Validators.required]);
  phenoDobControl = new FormControl(new Date(), [Validators.required]);
  phenopacketIdSubscription: Subscription;
  phenopacketSexSubscription: Subscription;
  phenopacketDobSubscription: Subscription;

  summary: string;
  sex: any;
  karyotypicSex: any;
  gender: any;
  dob: Date;
  individual: Individual;

  constructor() {
  }
  ngOnInit(): void {
    this.individual = this.phenopacket.subject;
    this.dob = this.individual.dateOfBirth;
    this.sex = this.individual.sex;
    this.karyotypicSex = this.individual.karyotypicSex;
    this.gender = this.individual.gender;

    // id update
    this.phenoIdControl.setValue(this.phenopacket.id);
    if (this.phenopacketIdSubscription) {
      this.phenopacketIdSubscription.unsubscribe();
    }
    this.phenopacketIdSubscription = this.phenoIdControl.valueChanges.subscribe(value => {
      if (value && value.length > 0) {
        this.onIdChanged.emit(value);
      }
    });
    // sex update
    this.phenoSexControl.setValue(this.sex);
    if (this.phenopacketSexSubscription) {
      this.phenopacketSexSubscription.unsubscribe();
    }
    this.phenopacketSexSubscription = this.phenoSexControl.valueChanges.subscribe(value => {
      if (value && value.length > 0) {
        this.onSexChanged.emit(value);
      }
    });
    // Dob update
    this.phenoDobControl.setValue(this.dob);
    if (this.phenopacketDobSubscription) {
      this.phenopacketDobSubscription.unsubscribe();
    }
    this.phenopacketDobSubscription = this.phenoDobControl.valueChanges.subscribe(value => {
      this.onDobChanged.emit(value);
    });
    
  }


  getKaryotypicSexes() {
    return Object.values(KaryotypicSex).filter(x => !(parseInt(x) >= 0));
  }

  getSexes() {
    return Object.values(Sex).filter(x => !(parseInt(x) >= 0));
  }
  deletePhenopacket() {

  }
  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    
  }
}