import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

// array in local storage for list of diseases
// let diseasesf = JSON.parse("") || [];
const diseases = require('../../assets/data/mondo.json');
const diseaseNames = require('../../assets/data/mondo-id-names.json');
const phenotypicFeatures = require('../../assets/data/hp.json');
const phenotypicFeaturesNames = require('../../assets/data/hp-id-names.json');
const bodySites = require('../../assets/data/human-view.json');
const modifiers = require('../../assets/data/modifiers.json');


@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;

        // wrap in delayed observable to simulate server api call
        return of(null)
            .pipe(mergeMap(handleRoute))
            // tslint:disable-next-line:max-line-length
            .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
            .pipe(delay(500))
            .pipe(dematerialize());

        function handleRoute() {
            switch (true) {
                case url.endsWith('/diseases') && method === 'GET':
                    console.log('fakebackend disease');
                    return getDiseases();
                case url.match(/\/diseases\/.*/) && method === 'GET':
                    return getDiseaseById();
                case url.endsWith('/phenotypic-features') && method === 'GET':
                    console.log('fakebackend phenotypic features');
                    return getPhenotypicFeatures();
                case url.match(/\/phenotypic-features\/.*/) && method === 'GET':
                    return getPhenotypicFeatureById();
                case url.endsWith('/bodysites') && method === 'GET':
                    console.log('fakebackend bodysites');
                    return getBodySites();
                case url.endsWith('modifiers') && method === 'GET':
                    console.log('fakebackend modifiers');
                    return getModifiers();
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }
        }

        // route functions
        function getDiseases() {
            return ok(diseaseNames);
        }

        function getDiseaseById() {
            const disease = diseases.find(x => x.id === idFromUrl());
            return ok(disease);
        }

        function getPhenotypicFeatures() {
            return ok(phenotypicFeaturesNames);
        }

        function getPhenotypicFeatureById() {
            const phenotypicFeature = phenotypicFeatures.find(x => x.id === idFromUrl());
            return ok(phenotypicFeature);
        }

        function getBodySites() {
            return ok(bodySites);
        }

        function getModifiers() {
            return ok(modifiers);
        }
        // helper functions

        // tslint:disable-next-line:no-shadowed-variable
        function ok(body?) {
            return of(new HttpResponse({ status: 200, body }));
        }

        function error(message) {
            return throwError({ error: { message } });
        }

        function unauthorized() {
            return throwError({ status: 401, error: { message: 'Unauthorised' } });
        }

        function isLoggedIn() {
            return headers.get('Authorization') === 'Bearer fake-jwt-token';
        }

        function idFromUrl() {
            const urlParts = url.split('/');
            return urlParts[urlParts.length - 1];
        }
    }
}

export const fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};
