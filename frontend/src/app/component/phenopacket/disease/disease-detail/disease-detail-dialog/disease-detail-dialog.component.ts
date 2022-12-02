import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Disease } from 'src/app/models/disease';

@Component({
  selector: 'app-disease-detail-dialog',
  templateUrl: './disease-detail-dialog.component.html',
  styleUrls: ['./disease-detail-dialog.component.scss']
})
export class DiseaseDetailDialogComponent implements OnInit {

  disease: Disease;

  constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig) {
    this.disease = config.data?.disease;
  }

  ngOnInit(): void {
  }

  updateDisease(disease) {
    this.disease = disease;
  }

  onCancelClick(): void {
    this.ref.close();
  }

  onOkClick() {
    this.ref.close(this.disease);
  }

}


