import {Component, Input, OnInit} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { OntologyClass, Procedure, TimeElement } from 'src/app/models/base';
import { ComplexValue, Measurement, Quantity, TypedQuantity, Value } from 'src/app/models/measurement';
import { MeasurementDetailDialogComponent } from './measurement-detail-dialog/measurement-detail-dialog.component';

@Component({
  selector: 'app-measurement-detail',
  templateUrl: './measurement-detail.component.html',
  styleUrls: ['./measurement-detail.component.scss']
})

export class MeasurementDetailComponent implements OnInit {
  @Input()
  measurement: Measurement;

  description: string;
  assay: OntologyClass;
  measurementValue: Value | ComplexValue;
  timeObserved: TimeElement;
  // procedure
  procedure: Procedure;
  procedureCode: OntologyClass;
  bodySite: OntologyClass;
  performed: TimeElement;
  // Value
  value: Quantity | OntologyClass;
  complexValue: TypedQuantity[];

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
    this.updateMeasurement();
  }

  updateMeasurement() {
    if (this.measurement) {
      if (this.measurement.value) {
        this.measurementValue = this.measurement.value;
      } else if (this.measurement.complexValue) {
        this.measurementValue = this.measurement.complexValue;
      }
      this.description = this.measurement.description;
      this.assay = this.measurement.assay;
      this.timeObserved = this.measurement.timeObserved;
      this.procedure = this.measurement.procedure;
      this.procedureCode = this.procedure?.code;
      this.bodySite = this.procedure?.bodySite;
      this.performed = this.procedure?.performed;
    }

  }

  openEditDialog() {
    const measurementDetailData = { 'title': 'Edit measurement' };
    measurementDetailData['measurement'] = this.measurement;
    measurementDetailData['displayCancelButton'] = true;
    const dialogRef = this.dialog.open(MeasurementDetailDialogComponent, {
      width: '1000px',
      data: measurementDetailData
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        const updatedMedicalAction = result.medical_action;
        if (updatedMedicalAction) {
          // update medical action
          this.measurement = updatedMedicalAction;
          this.updateMeasurement();
          // emit change
          // this.onFeatureChanged.emit(this.phenotypicFeature);
        }
      }
    });
    return dialogRef;
  }

  getAssay() {
    if (this.assay) {
      return this.assay.toString();
    }
    return '';
  }

  getMeasurementValue() {
    if (this.measurementValue) {
      return this.measurementValue.toString();
    }
    return '';
  }

  getTimeOfMeasurement() {
    if (this.timeObserved) {
      return this.timeObserved.toString();
    }
    return '';
  }
  getProcedure() {
    if (this.procedure) {
      return this.procedure.toString();
    }
    return '';
  }

}