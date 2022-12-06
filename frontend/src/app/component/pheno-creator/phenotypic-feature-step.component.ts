import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { Subscription } from 'rxjs';
import { OntologyClass } from 'src/app/models/base';
import { Phenopacket } from 'src/app/models/phenopacket';
import { PhenotypicFeature } from 'src/app/models/phenotypic-feature';
import { PhenopacketService } from 'src/app/services/phenopacket.service';
import { PhenotypeSearchService } from 'src/app/services/phenotype-search.service';
import { SpinnerDialogComponent } from '../shared/spinner-dialog/spinner-dialog.component';

@Component({
    providers: [ConfirmationService],
    selector: 'app-phenotypic-feature-step',
    templateUrl: './phenotypic-feature-step.component.html',
    styleUrls: ['./pheno-creator.component.scss']
})
export class PhenotypicFeatureStepComponent implements OnInit, OnDestroy {

    visible = false;
    phenopacket: Phenopacket;
    phenotypicFeatures: PhenotypicFeature[] = [];
    submitted = false;
    phenopacketSubscription: Subscription;

    // table contents of phenotypic features
    selectedFeature: PhenotypicFeature;
    // searchparams
    currSearchParams: any = {};
    spinnerDialogRef: any;

    constructor(public searchService: PhenotypeSearchService,
        public phenopacketService: PhenopacketService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private router: Router, public dialog: MatDialog,
        private primengConfig: PrimeNGConfig) {
    }


    ngOnInit() {
        this.primengConfig.ripple = true;
        this.phenopacket = this.phenopacketService.phenopacket;
        if (this.phenopacket === undefined) {
            // navigate to first page of creator as phenopacket is not created
            this.router.navigate(['pheno-creator/individual']);
        } else {
            this.phenotypicFeatures = this.phenopacket.phenotypicFeatures;
            if (this.phenotypicFeatures) {
                if (this.phenotypicFeatures.length > 0) {
                    this.visible = true;
                }
            }
        }

        this.phenopacketSubscription = this.phenopacketService.getPhenopacket().subscribe(phenopacket => {
            this.phenopacket = phenopacket;
            this.phenotypicFeatures = phenopacket.phenotypicFeatures;
        });
    }

    ngOnDestroy(): void {
        if (this.phenopacketSubscription) {
            this.phenopacketSubscription.unsubscribe();
        }
    }

    // Used for phenotypic feature search bar
    onSearchCriteriaChange(searchCriteria: any) {
        this.currSearchParams.offset = 0;
        const id = searchCriteria.selectedItems[0].selectedValue.id;

        if ((searchCriteria.selectedItems && searchCriteria.selectedItems.length > 0)) {
            this.currSearchParams = searchCriteria;
            this._queryPhenotypicFeatureById(id);
        }
    }

    private _queryPhenotypicFeatureById(id: string) {
        this.openSpinnerDialog();
        this.searchService.queryPhenotypicFeatureById(id).subscribe(data => {
            const phenotypicFeature = new PhenotypicFeature();
            phenotypicFeature.key = this.getBiggestKey() + 1;
            phenotypicFeature.type = new OntologyClass(data.id, data.name);
            phenotypicFeature.excluded = false;
            this.addPhenotypicFeature(phenotypicFeature);
            this.spinnerDialogRef.close();
        },
            (error) => {
                console.log(error);
                this.spinnerDialogRef.close();
            });
    }

    openSpinnerDialog() {
        this.spinnerDialogRef = this.dialog.open(SpinnerDialogComponent, {
            panelClass: 'transparent',
            disableClose: true
        });
    }

    /**
     *
     * @returns Returns the biggest key
     */
     getBiggestKey() {
        let key = 0;
        for (const feature of this.phenotypicFeatures) {
            if ((feature.key) >= key) {
                key = feature.key;
            }
        }
        return key;
    }

    /**
     * Adds a new phenotypic feature.
     **/
    addPhenotypicFeature(phenotypicFeature?: PhenotypicFeature) {
        if (phenotypicFeature === undefined) {
            return;
        }
        this.phenotypicFeatures.push(phenotypicFeature);
        // we copy the array after each update so the ngChange method is triggered on the child component
        this.phenotypicFeatures = this.phenotypicFeatures.slice();
        setTimeout(() => this.visible = true, 0);

        this.phenopacket.phenotypicFeatures = this.phenotypicFeatures;
        this.submitted = true;
        // make table visible
        this.visible = true;

    }

    deleteFeature(feature: PhenotypicFeature) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete \'' + feature.type.label + '\'?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.phenotypicFeatures = this.phenotypicFeatures.filter(val => val.type.id !== feature.type.id);
                this.selectedFeature = null;
                this.phenopacket.phenotypicFeatures = this.phenotypicFeatures;
                if (this.phenotypicFeatures.length === 0) {
                    this.visible = false;
                }
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Feature Deleted', life: 3000 });
            },
            reject: () => {
                this.confirmationService.close();
            }
        });
    }

    updatePhenotypicFeature(phenotypicFeature) {
        this.selectedFeature = phenotypicFeature;
    }

    /**
     * Called when a row is selected in the left side table
     * @param event
     */
    onRowSelect(event) {
        this.selectedFeature = event.data;
    }

    nextPage() {
        // this.phenopacket.phenotypicFeatures = this.phenotypicFeatures;
        // console.log(this.phenopacket);
        this.phenopacketService.setPhenopacket(this.phenopacket);
        this.phenopacketService.phenopacket = this.phenopacket;
        // this.router.navigate(['pheno-creator/measurements']);
        // TODO temp while measuremtn is not done
        this.router.navigate(['pheno-creator/diseases']);
        this.submitted = true;

        // console.log(this.phenopacketService.getPhenopacket());
    }
    prevPage() {
        this.phenopacketService.phenopacket = this.phenopacket;
        this.router.navigate(['pheno-creator/individual']);
    }
}