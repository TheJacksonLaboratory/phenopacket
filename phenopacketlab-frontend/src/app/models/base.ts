import { Utils } from '../component/shared/utils';

/**
 * Class to convert to list or list of phenopacket model objects.
 * the Phenopacket model objects that can have more than one instance should
 * extend this class.
 */
export class Convert {

    public static convert(obj: any): any {
        if (Array.isArray(obj)) {
            const array = [];
            for (const item of obj) {
                const it = this.create(item);
                it.key = Utils.getBiggestKey(array) + 1;
                array.push(it);
            }
            return array;
        } else {
            return this.create(obj);
        }
    }

    /**
     * To be overriden
     * @param obj
     */
    static create(obj: any): any {
        return new Error('this function needs to be overriden');
    }
}

export class OntologyClass extends Convert {
    // used for tnm finding or node key. Not part of the phenopacket schema
    key?: string;
    id = '';
    label = '';
    url?: string;

    constructor(id?: string, label?: string, key?: string, url?: string) {
        super();
        this.id = id;
        this.label = label;
        this.key = key;
        this.url = url;
    }

    static create(obj: any): OntologyClass {
        const ontologyClass = new OntologyClass();
        if (obj['id']) {
            ontologyClass.id = obj['id'];
        }
        if (obj['label']) {
            ontologyClass.label = obj['label'];
        }
        return ontologyClass;
    }

    toString() {
        if (this.label && this.id) {
            return `[${this.id}] ${this.label}`;
        }
        return '';

    }
    toLowerCase() {
        return this.toString().toLowerCase();
    }

}
export class ExternalReference extends Convert {
    id: string;
    reference: string;
    description: string;

    static create(obj: any): ExternalReference {
        const externalReference = new ExternalReference();
        if (obj['id']) {
            externalReference.id = obj['id'];
        }
        if (obj['reference']) {
            externalReference.reference = obj['reference'];
        }
        if (obj['description']) {
            externalReference.description = obj['description'];
        }
        return externalReference;
    }

    toString() {
        if (this.id && this.reference) {
            return `${this.reference} [${this.id}]`;
        } else if (this.id && this.reference === undefined) {
            return this.id;
        } else if (this.id === undefined && this.reference) {
            return this.reference;
        }
        return '';
    }
}
export class Evidence extends Convert {

    static VALUES = [
        new OntologyClass('ECO:0006016', 'author statement from published clinical study'),
        new OntologyClass('ECO:0007539', 'author statement from published clinical study used in automatic assertion'),
        new OntologyClass('ECO:0006017', 'author statement from published clinical study used in manual assertion'),
        new OntologyClass('ECO:0000033', 'author statement supported by traceable reference'),
        new OntologyClass('ECO:0006154', 'self-reported patient statement evidence')
    ];

    evidenceCode: OntologyClass;
    reference: ExternalReference;

    constructor(evidenceCode?: OntologyClass, reference?: ExternalReference) {
        super();
        this.evidenceCode = evidenceCode;
        this.reference = reference;
    }

    public static create(obj: any): Evidence {
        const evidence = new Evidence();
        if (obj['evidenceCode']) {
            evidence.evidenceCode = OntologyClass.convert(obj['evidenceCode']);
            evidence.evidenceCode.url = Evidence.getEvidenceUrl(evidence.evidenceCode.id);
        } else {
            throw new Error(`Phenopacket file is missing 'evidenceCode' field in 'evidence' object.`);
        }
        if (obj['reference']) {
            evidence.reference = ExternalReference.convert(obj['reference']);
        }
        return evidence;
    }

    public static getEvidenceUrl(id: string) {
        return `http://purl.obolibrary.org/obo/ECO_${id.split(':')[1]}`;
    }
}
export class Procedure {

    constructor() {
        this.code = new OntologyClass('', '');
    }
    static actionName = 'Procedure';
    code: OntologyClass;
    bodySite: OntologyClass;
    performed: TimeElement;

    static convert(obj: any): Procedure {
        const procedure = new Procedure();
        if (obj['code']) {
            procedure.code = OntologyClass.convert(obj['code']);
        } else {
            throw new Error(`Phenopacket file is missing 'code' field in 'procedure' object.`);
        }
        if (obj['bodySite']) {
            procedure.bodySite = OntologyClass.convert(obj['bodySite']);
        }
        if (obj['performed']) {
            procedure.performed = TimeElement.convert(obj['performed']);
        }

        return procedure;
    }

    toString() {
        if (this.code) {
            return this.code.toString();
        }
        return '';
    }
}
export class Age {
    iso8601duration: string;

    constructor(val?: string) {
        this.iso8601duration = val;
    }

    public static convert(obj: any): Age {
        const age = new Age();
        if (obj['iso8601duration']) {
            age.iso8601duration = obj['iso8601duration'];
        }
        return age;
    }

    /**
     *
     * @param years
     * @param months
     * @param days
     * @returns an ISO8601 duration
     */
    public static convertToIso8601(years: number, months: number, days: number): string {
        let isoStr: string;
        let yearsStr = '';
        if (years) {
            yearsStr = `${years}Y`;
        }
        let monthsStr = '';
        if (months) {
            monthsStr = `${months}M`;
        }
        let daysStr = '';
        if (days) {
            daysStr = `${days}D`;
        }
        if (yearsStr !== '' || monthsStr !== '' || daysStr !== '') {
            isoStr = `P${yearsStr}${monthsStr}${daysStr}`;
        }
        return isoStr;
    }

    public getYears() {
        if (this.iso8601duration) {
            const prefix = this.iso8601duration.split('Y');
            if (prefix) {
                // tslint:disable-next-line:radix
                return parseInt(prefix[0]?.substring(1));
            }
        }
    }
    public getMonths() {
        if (this.iso8601duration) {
            let prefix = this.iso8601duration.split('M');
            if (prefix.length > 0) {
                prefix = prefix[0].split('Y');
                if (prefix.length > 0) {
                    // tslint:disable-next-line:radix
                    return parseInt(prefix[1]);
                }
            } else {
                return null;
            }
        }
    }
    public getDays() {
        if (this.iso8601duration) {
            const prefix = this.iso8601duration.split('M');
            if (prefix.length > 0) {
                // tslint:disable-next-line:radix
                return parseInt(prefix[1]?.substring(0, prefix[1]?.length - 1));
            } else {
                return null;
            }
        }
    }
}

export class AgeRange {
    start: Age;
    end: Age;
    constructor(start?: Age, end?: Age) {
        this.start = start;
        this.end = end;
    }

    public static convert(obj: any): AgeRange {
        const ageRange = new AgeRange();
        if (obj['start']) {
            ageRange.start = Age.convert(obj['start']);
        }
        if (obj['end']) {
            ageRange.end = Age.convert(obj['end']);
        }
        return ageRange;
    }
}

export class TimeInterval {
    start: string;
    end: string;
    constructor(start?: string, end?: string) {
        this.start = start;
        this.end = end;
    }

    public static convert(obj: any): TimeInterval {
        const interval = new TimeInterval();
        if (obj['start']) {
            interval.start = obj['start'];
        } else {
            throw new Error(`Phenopacket file is missing 'start' field in 'timeInterval' object.`);
        }
        if (obj['end']) {
            interval.end = obj['end'];
        } else {
            throw new Error(`Phenopacket file is missing 'end' field in 'timeInterval' object.`);
        }
        return interval;
    }
}

export class GestationalAge {
    weeks: number;
    days: number;
    constructor(weeks?: number, days?: number) {
        this.weeks = weeks;
        this.days = days;
    }

    public static convert(obj: any): GestationalAge {
        const gestationalAge = new GestationalAge();
        if (obj['weeks']) {
            gestationalAge.weeks = obj['weeks'];
        } else {
            throw new Error(`Phenopacket file is missing 'weeks' field in 'gestationalAge' object.`);
        }
        if (obj['days']) {
            gestationalAge.days = obj['days'];
        }
        return gestationalAge;
    }
}
export class TimeElement extends Convert {

    age: Age;
    ageRange: AgeRange;
    gestationalAge: GestationalAge;
    ontologyClass: OntologyClass;
    timestamp: string;
    interval: TimeInterval;
    /**
     *
     * @param element can be instance of GestationalAge, Age, AgeRange, string or TimeInterval
     */
    constructor(element?: any) {
        super();
        if (element instanceof Age) {
            this.age = element;
        } else if (element instanceof AgeRange) {
            this.ageRange = element;
        } else if (element instanceof GestationalAge) {
            this.gestationalAge = element;
        } else if (element instanceof OntologyClass) {
            this.ontologyClass = element;
        } else if (typeof element === 'string') {
            this.timestamp = element;
        } else if (element instanceof TimeInterval) {
            this.interval = element;
        }
    }

    static create(obj: any): TimeElement {
        const timeElement = new TimeElement();
        if (obj['age']) {
            timeElement.age = Age.convert(obj['age']);
        } else if (obj['ageRange']) {
            timeElement.ageRange = AgeRange.convert(obj['ageRange']);
        } else if (obj['gestationalAge']) {
            timeElement.gestationalAge = GestationalAge.convert(obj['gestationalAge']);
        } else if (obj['ontologyClass']) {
            timeElement.ontologyClass = OntologyClass.convert(obj['ontologyClass']);
            timeElement.ontologyClass.url = `https://hpo.jax.org/app/browse/term/${timeElement.ontologyClass.id}`;
        } else if (obj['timestamp']) {
            timeElement.timestamp = obj['timestamp'];
        } else if (obj['interval']) {
            timeElement.interval = TimeInterval.convert(obj['interval']);
        }
        return timeElement;
    }

    toString() {
        if (this.gestationalAge) {
            let weeksStr = ''; let daysStr = '';
            if (this.gestationalAge.weeks) {
                weeksStr = `${this.gestationalAge.weeks} week(s)`;
            }
            if (this.gestationalAge.days) {
                daysStr = `${this.gestationalAge.days} day(s)`;
            }
            return `${weeksStr} - ${daysStr} `;
        } else if (this.age instanceof Age) {
            return this.age.iso8601duration;
        } else if (this.ontologyClass) {
            return this.ontologyClass.toString();
        } else if (this.ageRange) {
            return `${this.ageRange.start?.iso8601duration} - ${this.ageRange.end?.iso8601duration}`;
        } else if (this.timestamp) {
            return this.timestamp;
        } else if (this.interval) {
            return `${this.interval.start} - ${this.interval.end}`;
        }
    }

    /**
     *
     * @returns Copy the object into a new one
     */
    public copy(): TimeElement {
        if (this.age) {
            return new TimeElement(new Age(this.age.iso8601duration));
        } else if (this.ageRange) {
            return new TimeElement(new AgeRange(this.ageRange.start, this.ageRange.end));
        } else if (this.gestationalAge) {
            return new TimeElement(new GestationalAge(this.gestationalAge.weeks, this.gestationalAge.days));
        } else if (this.ontologyClass) {
            return new TimeElement(new OntologyClass(this.ontologyClass.id, this.ontologyClass.label));
        } else if (this.timestamp) {
            return new TimeElement(this.timestamp);
        } else if (this.interval) {
            return new TimeElement(new TimeInterval(this.interval.start, this.interval.end));
        }
    }

}
export enum TimeElementType {
    AGE = 'Age',
    AGE_RANGE = 'Age range',
    GESTATIONAL_AGE = 'Gestational age',
    ONTOLOGY_CLASS = 'Ontology class'
}
export enum TimeElementId {
    INDIVIDUAL_TIME_OF_DEATH,
    INDIVIDUAL_ONSET,
    PHENOTYPIC_ONSET,
    PHENOTYPIC_RESOLUTION,
    DISEASE_ONSET,
    DISEASE_RESOLUTION
}
export class File extends Convert {
    id: string; // not part of the phenopacket model (used only to distinguish between files)
    uri: string;
    individualToFileIdentifier = new Map<string, string>();
    fileAttribute = new Map<string, string>();

    constructor(uri?: string, description?: string) {
        super();
        this.uri = uri;
        this.fileAttribute.set('description', description);

    }
    static create(obj: any): File {
        const file = new File();
        if (obj['uri']) {
            file.uri = obj['uri'];
        } else {
            throw new Error(`Phenopacket file is missing 'uri' field in 'file' object.`);
        }
        if (obj['individualToFileIdentifier']) {
            file.individualToFileIdentifier = obj['individualToFileIdentifier'];
        }
        if (obj['fileAttribute']) {
            file.fileAttribute = obj['fileAttribute'];
        }

        return file;
    }
}
