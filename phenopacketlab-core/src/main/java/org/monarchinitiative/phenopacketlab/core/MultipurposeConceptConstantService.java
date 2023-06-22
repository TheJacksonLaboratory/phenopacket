package org.monarchinitiative.phenopacketlab.core;

import org.monarchinitiative.phenol.ontology.data.TermId;
import org.monarchinitiative.phenopacketlab.core.model.IdentifiedConcept;
import org.monarchinitiative.phenopacketlab.core.model.IdentifiedConceptResource;
import org.monarchinitiative.phenopacketlab.core.model.SearchIdentifiedConcept;

import java.util.*;
import java.util.stream.Stream;

/**
 * {@linkplain MultipurposeConceptConstantService} uses {@link ConceptResourceService} to fetch concepts to be used
 * in various parts of the application.
 */
public class MultipurposeConceptConstantService implements DiseaseService, PhenotypicFeatureService {

    private final ConceptResourceService conceptResourceService;
    private final List<String> diseasePrefixes;
    private final List<String> phenotypePrefixes;

    public MultipurposeConceptConstantService(ConceptResourceService conceptResourceService,
                                              Collection<String> diseasePrefixes,
                                              List<String> phenotypePrefixes) {
        this.conceptResourceService = Objects.requireNonNull(conceptResourceService);
        this.diseasePrefixes = List.copyOf(Objects.requireNonNull(diseasePrefixes));
        this.phenotypePrefixes = List.copyOf(Objects.requireNonNull(phenotypePrefixes));
    }

    @Override
    public Collection<String> diseaseNamespacePrefixes() {
        return diseasePrefixes;
    }

    @Override
    public Optional<IdentifiedConcept> diseaseConceptById(TermId id) {
        return findConceptFromSelectedPrefixes(id, diseasePrefixes);
    }

    @Override
    public Stream<IdentifiedConcept> allDiseaseConcepts() {
        return findAllConceptsFromSelectedPrefixes(diseasePrefixes);
    }

    @Override
    public Stream<IdentifiedConcept> searchDiseaseConcepts(String query, int limit) {
        return findAllConceptsFromSelectedPrefixes(diseasePrefixes)
                .filter(ic -> (ic.id().getValue().toLowerCase() + ic.getName().toLowerCase()).contains(query.toLowerCase())).limit(limit);
    }

    @Override
    public Collection<String> phenotypeNamespacePrefixes() {
        return phenotypePrefixes;
    }

    @Override
    public Optional<IdentifiedConcept> phenotypeConceptById(TermId id) {
        return findConceptFromSelectedPrefixes(id, phenotypePrefixes);
    }

    @Override
    public Stream<IdentifiedConcept> allPhenotypeConcepts() {
        return findAllConceptsFromSelectedPrefixes(phenotypePrefixes);
    }

    @Override
    public SearchIdentifiedConcept searchPhenotypeConcepts(String query, int limit) {
        List<IdentifiedConcept> allTerms = findAllConceptsFromSelectedPrefixes(phenotypePrefixes).toList();
        List<IdentifiedConcept> foundTerms = allTerms.stream().filter(ic -> (ic.id().getValue().toLowerCase() + ic.getName().toLowerCase()).contains(query.toLowerCase())).limit(limit).toList();
        return new SearchIdentifiedConcept(allTerms.size(), foundTerms);
    }

    private Stream<IdentifiedConcept> findAllConceptsFromSelectedPrefixes(List<String> prefixes) {
        return prefixes.stream()
                .map(conceptResourceService::forPrefix)
                .flatMap(Optional::stream)
                .flatMap(IdentifiedConceptResource::stream)
                // TODO a temporary bugfix for an issue resulting from incorrect loading of the HPO/others.
                .filter(ic -> prefixes.contains(ic.id().getPrefix()));
    }

    private Optional<IdentifiedConcept> findConceptFromSelectedPrefixes(TermId id, List<String> prefixes) {
        if (prefixes.contains(id.getPrefix())) {
            return conceptResourceService.forPrefix(id.getPrefix())
                    .flatMap(cr -> cr.conceptForTermId(id));
        }

        return Optional.empty();
    }
}
