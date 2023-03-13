import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Profile, ProfileSelection } from 'src/app/models/profile';
import { PhenopacketService } from 'src/app/services/phenopacket.service';

@Component({
    selector: 'app-profile-selection',
    templateUrl: './profile-selection.component.html',
    styleUrls: ['./profile-selection.component.scss']
})
export class ProfileSelectionComponent implements OnInit {

    options: any;
    profileSelected: any;
    submitted = false;

    constructor(public phenopacketService: PhenopacketService, private router: Router) { }

    ngOnInit() {
        this.options = Profile.profileSelectionOptions;
    }

    start() {
        for (const profile of Profile.profileSelectionOptions) {
            if (this.profileSelected === profile.value) {
                this.phenopacketService.setProfileSelection(profile.value);
                this.router.navigate([`creator/${profile.path}`]);
            }
        }
    }
    startRareDisease() {
        this.phenopacketService.setProfileSelection(ProfileSelection.RARE_DISEASE);
        this.router.navigate(['creator/rare']);
    }
    startAll() {
        this.phenopacketService.setProfileSelection(ProfileSelection.ALL_AVAILABLE);
        this.router.navigate(['creator/all']);
    }

}
