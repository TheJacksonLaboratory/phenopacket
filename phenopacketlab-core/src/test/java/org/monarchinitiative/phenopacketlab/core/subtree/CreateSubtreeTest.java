package org.monarchinitiative.phenopacketlab.core.subtree;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.monarchinitiative.phenol.io.OntologyLoader;
import org.monarchinitiative.phenol.ontology.data.Ontology;
import org.monarchinitiative.phenol.ontology.data.TermId;
import org.monarchinitiative.phenopacketlab.core.TestUtils;

import java.nio.file.Path;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

public class CreateSubtreeTest {

    private static final Path TOY_HPO_PATH = TestUtils.PHENOPACKET_LAB_CORE_TEST_DIR.resolve("ontology/hpo_toy.json");

    private static Ontology HPO;

    @BeforeAll
    public static void beforeAll() {
        HPO = OntologyLoader.loadOntology(TOY_HPO_PATH.toFile());
    }


    @Test
    public void createSubtree() {
        TermId onset = TermId.of("HP:0003674");
        SubtreeNode root = CreateSubtree.createSubtree(onset, HPO);

        assertThat(root.getKey(), equalTo(onset.getValue()));
        assertThat(root.getLabel(), equalTo("Onset"));
        assertThat(root.getChildren(), hasSize(6));
        assertThat(root.getChildren().stream()
                .map(SubtreeNode::getLabel)
                .toList(),
                hasItems("Antenatal onset", "Adult onset", "Congenital onset",
                        "Neonatal onset", "Puerpural onset", "Pediatric onset"));
    }
}