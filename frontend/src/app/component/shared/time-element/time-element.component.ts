import { Component, EventEmitter, Output } from '@angular/core';
import { Age, AgeRange, GestationalAge, OntologyClass, TimeElement } from 'src/app/models/base';

@Component({
  selector: 'app-time-element',
  templateUrl: './time-element.component.html',
  styleUrls: ['./time-element.component.scss']
})

export class TimeElementComponent {
  selectedAgeType: string;

  @Output() timeElementEvent = new EventEmitter<TimeElement>();

  timeElement: TimeElement;

  age: Age;
  ageRange: AgeRange;
  gestationalAge: GestationalAge = new GestationalAge();
  ontologyClass: OntologyClass;

  rangeDates: Date[];

  ageTypes: string[] = ['Age', 'Age Range', 'Gestational Age', 'Ontology Class'];
  // days: string[] = ['0', '1', '2', '3', '4', '5', '6'];

  // TODO - fetch from backend
  ontologies: string[] = ['Adult onset', 'Pediatric onset', 'Antenatal onset', 'Neonatal onset', 'Puerpural onset', 'Congenital onset'];

  updateTimeElement(timeElement: any) {
    this.timeElement = timeElement;
    this.timeElementEvent.emit(this.timeElement);
  }
}