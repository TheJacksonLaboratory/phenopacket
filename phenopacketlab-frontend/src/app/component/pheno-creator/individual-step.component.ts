import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { Individual } from 'src/app/models/individual';
import { MetaData } from 'src/app/models/metadata';
import { Phenopacket } from 'src/app/models/phenopacket';
import { ProfileSelection } from 'src/app/models/profile';
import { PhenopacketStepperService } from 'src/app/services/phenopacket-stepper.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { OntologyClass } from 'src/app/models/base';
import { Utils } from '../shared/utils';

@Component({
    selector: 'app-individual-step',
    templateUrl: './individual-step.component.html',
    styleUrls: ['./pheno-creator.component.scss']
})
export class IndividualStepComponent implements OnInit, OnDestroy {

    phenopacket: Phenopacket;

    phenopacketSubscription: Subscription;
    submitted = false;

    profileSelectionSubscription: Subscription;
    profileSelection: ProfileSelection;

    privateInfoWarnSelectedSubscription: Subscription;
    taxonomySubscription: Subscription;

    summary: string;

    constructor(public phenopacketService: PhenopacketStepperService,
        private constantsService: ConstantsService) {

    }

    ngOnInit() {
        this.phenopacket = this.phenopacketService.phenopacket;
        if (this.phenopacket === undefined) {
            // get taxonomy and initialize phenopacket
            this.taxonomySubscription = this.constantsService.getHomoSapiensTaxonomy().subscribe(taxon => {
                if (taxon) {
                    this.phenopacket = new Phenopacket();
                    const subject = new Individual();
                    subject.taxonomy = new OntologyClass(taxon.id, taxon.lbl, undefined, Utils.getUrlForId(taxon.id));
                    this.phenopacket.subject = subject;
                    this.phenopacket.metaData = new MetaData();
                }
            });

        }
        this.profileSelectionSubscription = this.phenopacketService.getProfileSelection().subscribe(profile => {
            this.profileSelection = profile;
        });

        // Initialize the phenopacket
        this.phenopacketService.phenopacket = this.phenopacket;

    }

    ngOnDestroy() {
        if (this.phenopacketSubscription) {
            this.phenopacketSubscription.unsubscribe();
        }
        if (this.profileSelectionSubscription) {
            this.profileSelectionSubscription.unsubscribe();
        }
        if (this.taxonomySubscription) {
            this.taxonomySubscription.unsubscribe();
        }
    }

    generateNewID() {
        if (this.phenopacket) {
            this.phenopacket.id = uuidv4();
        }
    }

    updateSubject(subject: Individual) {
        if (this.phenopacket) {
            this.phenopacket.subject = subject;
        }
    }
}
