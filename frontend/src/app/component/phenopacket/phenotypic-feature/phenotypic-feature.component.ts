import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';

import { PhenotypicFeature } from 'src/app/models/phenotypic-feature';
import { PhenotypeSearchService } from 'src/app/services/phenotype-search.service';
import { Evidence, OntologyClass, TimeElement } from 'src/app/models/base';
import { MessageDialogComponent } from '../../shared/message-dialog/message-dialog.component';
import { SpinnerDialogComponent } from '../../shared/spinner-dialog/spinner-dialog.component';
import { DataPresentMatTableDataSource } from '../../shared/DataPresentMatTableDataSource';

@Component({
    selector: 'app-phenotypic-feature',
    templateUrl: './phenotypic-feature.component.html',
    styleUrls: ['./phenotypic-feature.component.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed, void', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
            transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
})
export class PhenotypicFeatureComponent implements AfterViewInit, OnInit {
    // search params
    itemName = "Phenotypic feature";
    searchLabel = "Phenotypic feature";
    placeHolderTxt = "Enter a phenotypic feature name";
    localStorageKey = "phenotypic_features";

    //Table items
    displayedColumns = ['label', 'status', 'onset', 'resolution', 'severity', 'modifiers', 'evidence', 'remove'];

    phenotypicDataSource = new DataPresentMatTableDataSource<PhenotypicFeature>();

    phenotypicCount: number;

    //searchparams
    currSearchParams: any = {}

    expandedElement: PhenotypicFeature | null;

    @Input()
    phenotypicFeatures: PhenotypicFeature[];
    @Output()
    onPhenotypicFeaturesChanged = new EventEmitter<PhenotypicFeature[]>();

    dialogRef: any;
    spinnerDialogRef: any;

    constructor(public searchService: PhenotypeSearchService, public dialog: MatDialog) {
    }

    ngOnInit() {
        this.phenotypicDataSource.data = this.phenotypicFeatures;
    }

    ngAfterViewInit() {
    }

    /**
     * Add a new phenotypic feature with default values or no values
     */
    addPhenotypicFeature(phenotypicFeature?: PhenotypicFeature) {
        if (phenotypicFeature === undefined) {
            let feature = new PhenotypicFeature();
            feature.description = 'Phenotypic Feature description';
            feature.type = new OntologyClass('id', 'name');
            feature.onset = new TimeElement('');
            feature.evidence = [new Evidence(new OntologyClass('', ''))];
            feature.excluded = false;
            feature.resolution = new TimeElement('');
            feature.severity = new OntologyClass('', '');
            feature.modifiers = [new OntologyClass('', '')];
            this.phenotypicFeatures.push(feature);
        } else {
            this.phenotypicFeatures.push(phenotypicFeature);
        }
        this.phenotypicDataSource.data = this.phenotypicFeatures;
        this.onPhenotypicFeaturesChanged.emit(this.phenotypicFeatures);
        // TODO push changes to api
    }

    /**
     * Removes the chosen element, if ok is pressed on the popup window.
     * @param element 
     * @returns 
     */
    deleteFeature(element: PhenotypicFeature) {
        const msgData = { 'title': 'Delete Phenotypic Feature' };
        msgData['description'] = `Delete the Phenotypic Feature named "${element.type.label}" ?`;
        msgData['displayCancelButton'] = true;
        const dialogRef = this.dialog.open(MessageDialogComponent, {
            width: '400px',
            data: msgData
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result === 'ok') {
                this.removeFromDatasource(element);
            }
        });
        return dialogRef;
    }

    removeFromDatasource(phenoFeature: PhenotypicFeature) {
        this.phenotypicFeatures.forEach((element, index) => {
            if (element == phenoFeature) {
                this.phenotypicFeatures.splice(index, 1);
            }
        });
        this.phenotypicDataSource.data = this.phenotypicFeatures;
        this.onPhenotypicFeaturesChanged.emit(this.phenotypicFeatures);
    }

    onSearchCriteriaChange(searchCriteria: any) {
        this.currSearchParams.offset = 0;
        console.log("selectedItems[]");
        console.log(searchCriteria.selectedItems[0].selectedValue.id);
        let id = searchCriteria.selectedItems[0].selectedValue.id;

        if ((searchCriteria.selectedItems && searchCriteria.selectedItems.length > 0)) {
            this.currSearchParams = searchCriteria;
            this._queryPhenotypicFeatureById(id);
        }
    }

    private _queryPhenotypicFeatureById(id: string) {
        this.openSpinnerDialog();
        this.searchService.queryPhenotypicFeatureById(id).subscribe(data => {
            let phenotypicFeature = new PhenotypicFeature();
            phenotypicFeature.type = {id: data.id, label: data.name};
            phenotypicFeature.description = data.description;
            phenotypicFeature.onset = new TimeElement('');
            phenotypicFeature.evidence = [new Evidence(new OntologyClass('', ''))];
            phenotypicFeature.excluded = false;
            phenotypicFeature.resolution = new TimeElement('');
            phenotypicFeature.severity = new OntologyClass('', '');
            phenotypicFeature.modifiers = [new OntologyClass('', '')];
            this.addPhenotypicFeature(phenotypicFeature);
            this.spinnerDialogRef.close();
        },
            (error) => {
                this.spinnerDialogRef.close();
            });
    }

    expandCollapse(element: any) {
        this.expandedElement = this.expandedElement === element ? null : element

    }

    openSpinnerDialog() {
        this.spinnerDialogRef = this.dialog.open(SpinnerDialogComponent, {
            panelClass: 'transparent',
            disableClose: true
        });
    }

    getModifiers(phenotypicFeature: PhenotypicFeature) {
        if (phenotypicFeature.modifiers) {
            let modifierStr = '';
            for (let modifier of phenotypicFeature.modifiers) {
                modifierStr += `${modifier.label}, `;
            }
            return modifierStr;
        }
        return '';
    }

}

