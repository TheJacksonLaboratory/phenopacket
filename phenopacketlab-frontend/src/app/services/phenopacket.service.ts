import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Phenopacket } from '../models/phenopacket';
import { ProfileSelection } from '../models/profile';

const phenopacketValidateUrl = environment.PHENO_VALIDATE_URL;
const modifiersUrl = environment.MODIFIERS_URL;
const mondoDiseasesUrl = environment.MONDO_DISEASES_URL;
const onsetsUrl = environment.ONSETS_URL;
const tnmTumorFindingsUrl = environment.TNM_TUMOR_URL;
const tnmNodeFindingsUrl = environment.TNM_NODE_URL;
const tnmMetastasisFindingsUrl = environment.TNM_METASTASIS_URL;
const diseaseStagesUrl = environment.DISEASE_STAGES_URL;
const sexUrl = environment.SEX_URL;
const genderUrl = environment.GENDER_URL;
const lateralityUrl = environment.LATERALITY_URL;
const severityUrl = environment.SEVERITY_URL;

@Injectable({
    providedIn: 'root'
})
export class PhenopacketService {

    phenopacket: Phenopacket;
    phenopacketSubject = new Subject<Phenopacket>();

    profileSelection = new BehaviorSubject<ProfileSelection>(ProfileSelection.ALL_AVAILABLE);

    private validated = new Subject<any>();
    validated$ = this.validated.asObservable();

    constructor(private http: HttpClient) {
    }
    setPhenopacket(phenopacket: Phenopacket) {
        this.phenopacket = phenopacket;
        this.phenopacketSubject.next(phenopacket);
    }
    getPhenopacket(): Observable<Phenopacket> {
        return this.phenopacketSubject.asObservable();
    }

    validatePhenopacket(phenopacket: string): Observable<any> {
        return this.http.post(phenopacketValidateUrl, {data: phenopacket});
    }

    getModifiers(): Observable<any> {
        return this.http.get(modifiersUrl);
    }
    getMondoDiseases(): Observable<any> {
        return this.http.get(mondoDiseasesUrl);
    }
    getSex(): Observable<any> {
        return this.http.get(sexUrl);
    }
    getGender(): Observable<any> {
        return this.http.get(genderUrl);
    }
    getLaterality(): Observable<any> {
        return this.http.get(lateralityUrl);
    }
    getSeverity(): Observable<any> {
        return this.http.get(severityUrl);
    }
    getOnsets(): Observable<any> {
        return this.http.get(onsetsUrl);
    }
    getTnmTumorFindings(): Observable<any> {
        return this.http.get(tnmTumorFindingsUrl);
    }
    getTnmNodeFindings(): Observable<any> {
        return this.http.get(tnmNodeFindingsUrl);
    }
    getTnmMetastasisFindings(): Observable<any> {
        return this.http.get(tnmMetastasisFindingsUrl);
    }
    getDiseaseStages(): Observable<any> {
        return this.http.get(diseaseStagesUrl);
    }
    setProfileSelection(profile: ProfileSelection) {
        this.profileSelection.next(profile);
    }
    getProfileSelection(): Observable<ProfileSelection> {
        return this.profileSelection.asObservable();
    }
 }
