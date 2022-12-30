import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

import { Phenopacket } from 'src/app/models/phenopacket';
import { PhenopacketService } from 'src/app/services/phenopacket.service';

@Component({
  selector: 'app-pheno-creator-all',
  templateUrl: './pheno-creator.component.html',
  styleUrls: ['./pheno-creator.component.scss'],
  providers: [MessageService]
})
export class PhenoCreatorAllComponent implements OnInit, OnDestroy {

  phenopacket: Phenopacket;

  // primeng stepper
  items: MenuItem[];
  subscription: Subscription;

  constructor(private messageService: MessageService, public phenopacketService: PhenopacketService) {
  }

  ngOnInit() {
    this.items = [{
      label: 'Individual',
      routerLink: 'individual'
    },
    {
      label: 'Phenotypic Feature(s)',
      routerLink: 'phenotypic-features'
    },
    {
      label: 'Measurement(s)',
      routerLink: 'measurements'
    },
    {
      label: 'Biosample(s)',
      routerLink: 'biosamples'
    },
    {
      label: 'Interpretation(s)',
      routerLink: 'interpretations'
    },
    {
      label: 'Disease(s)',
      routerLink: 'diseases'
    },
    {
      label: 'Medical Action(s)',
      routerLink: 'medical-actions'
    },
    {
      label: 'File(s)',
      routerLink: 'files'
    },
    {
      label: 'Validate',
      routerLink: 'validate'
    }
    ];

    this.subscription = this.phenopacketService.validated$.subscribe((phenopacket) => {
      this.messageService.add({ severity: 'success', summary: 'Phenopacket created',
        detail: 'The phenopacket with the ID ' + phenopacket.subject.id + ' has been successfully validated.' });
    });

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}