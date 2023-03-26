import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GeneDescriptor, GenomicInterpretation, InterpretationStatus, VariantInterpretation } from 'src/app/models/interpretation';
import { InterpretationService } from 'src/app/services/interpretation.service';

@Component({
    selector: 'app-genomic-interpretation',
    templateUrl: './genomic-interpretation.component.html',
    styleUrls: ['./genomic-interpretation.component.scss']
})
export class GenomicInterpretationComponent implements OnInit {

    @Input()
    genomicInterpretation: GenomicInterpretation;
    @Output()
    genomicInterpretationChange = new EventEmitter<GenomicInterpretation>();

    selectedInterpretationStatus: InterpretationStatus;
    interpretationStatuses = Object.keys(InterpretationStatus).filter((item) => isNaN(Number(item)));


    constructor(public searchService: InterpretationService) {
    }

    ngOnInit() {
    }

    updateInterpretationStatus(event) {
        console.log(event);
        this.genomicInterpretation.interpretationStatus = event.value;
        console.log(this.genomicInterpretation.interpretationStatus);
        this.genomicInterpretationChange.emit(this.genomicInterpretation);
    }

    addVariantInterpretation(variantInterpretation: VariantInterpretation) {
        this.genomicInterpretation.variantInterpretation = variantInterpretation;
        this.genomicInterpretation.geneDescriptor = undefined;
        this.genomicInterpretationChange.emit(this.genomicInterpretation);
    }

    addGeneDescriptor(geneDescriptor: GeneDescriptor) {
        this.genomicInterpretation.variantInterpretation = undefined;
        this.genomicInterpretation.geneDescriptor = geneDescriptor;
        this.genomicInterpretationChange.emit(this.genomicInterpretation);
    }

}