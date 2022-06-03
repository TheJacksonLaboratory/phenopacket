package org.monarchinitiative.phenopacketlab.model;

import org.monarchinitiative.phenol.ontology.data.Ontology;
import org.monarchinitiative.phenol.ontology.data.Term;
import org.monarchinitiative.phenol.ontology.data.TermId;
import org.monarchinitiative.phenol.ontology.data.TermSynonym;
import org.monarchinitiative.phenopacketlab.model.util.MappingIterator;

import java.util.Iterator;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

public interface OntologyConceptResource extends IdentifiedConceptResource {

    static OntologyConceptResource of(Ontology ontology, Resource resource) {
        return new OntologyConceptResourceDefault(ontology, resource);
    }

    Ontology getOntology();

    @Override
    default Iterator<IdentifiedConcept> iterator() {
        // TODO - how about the obsolete terms?
        return MappingIterator.of(getOntology().getTerms().iterator(), termToConcept());
    }

    @Override
    default int size() {
        return getOntology().countAllTerms();
    }

    @Override
    default Optional<IdentifiedConcept> conceptForTermId(TermId termId) {
        return Optional.ofNullable(getOntology().getTermMap().get(termId))
                .flatMap(termToConcept());
    }

    private static Function<Term, Optional<IdentifiedConcept>> termToConcept() {
        return t -> Optional.of(new IdentifiedConceptDefault(t.id(),
                t.getName(),
                t.getDefinition(),
                t.getSynonyms().stream()
                        .map(TermSynonym::getValue)
                        .collect(Collectors.toList())));
    }
}
