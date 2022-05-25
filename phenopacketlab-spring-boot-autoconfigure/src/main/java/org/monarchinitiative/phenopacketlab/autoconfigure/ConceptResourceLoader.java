package org.monarchinitiative.phenopacketlab.autoconfigure;

import org.monarchinitiative.phenopacketlab.autoconfigure.exception.InvalidResourceException;
import org.monarchinitiative.phenopacketlab.io.ConceptResourceLoaders;
import org.monarchinitiative.phenopacketlab.io.HgncConceptLoader;
import org.monarchinitiative.phenopacketlab.model.ConceptResource;
import org.monarchinitiative.phenopacketlab.model.ConceptResources;
import org.monarchinitiative.phenopacketlab.model.OntologyConceptResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Class for parallel loading of {@link ConceptResources}.
 */
class ConceptResourceLoader {

    private static final Logger LOGGER = LoggerFactory.getLogger(ConceptResourceLoader.class);

    private final ExecutorService executor;
    private final PhenopacketLabDataResolver dataResolver;

    ConceptResourceLoader(ExecutorService executor,
                                 PhenopacketLabDataResolver dataResolver) {
        this.executor = Objects.requireNonNull(executor);
        this.dataResolver = Objects.requireNonNull(dataResolver);
    }

    ConceptResources load() throws InvalidResourceException {
        Resources result = new Resources();
        List<String> errors = Collections.synchronizedList(new LinkedList<>());
        List<ResourceTuple<?>> resources = List.of(
                new ResourceTuple<>(dataResolver.efoJsonPath(), ConceptResourceLoaders::efo, result::setEfo),
                new ResourceTuple<>(dataResolver.genoJsonPath(), ConceptResourceLoaders::geno, result::setGeno),
                new ResourceTuple<>(dataResolver.hgncCompleteSetPath(), is -> HgncConceptLoader.load(is, "HGNC_VERSION"), result::setHgnc),
                new ResourceTuple<>(dataResolver.hpJsonPath(), ConceptResourceLoaders::hpo, result::setHp),
                new ResourceTuple<>(dataResolver.mondoJsonPath(), ConceptResourceLoaders::mondo, result::setMondo),
                new ResourceTuple<>(dataResolver.soJsonPath(), ConceptResourceLoaders::so, result::setSo),
                new ResourceTuple<>(dataResolver.uberonJsonPath(), ConceptResourceLoaders::uberon, result::setUberon)
        );

        CountDownLatch latch = new CountDownLatch(resources.size());
        for (ResourceTuple<?> resource : resources) {
            executor.submit(prepareTask(resource, errors::add, latch));
        }

        try {
            latch.await();
        } catch (InterruptedException e) { // TODO - handle
            throw new RuntimeException(e);
        }

        if (!errors.isEmpty())
            throw new InvalidResourceException(String.format("Error(s): %s", errors.stream().collect(Collectors.joining("', '", "'", "'"))));

        return new ConceptResources(result.efo, result.geno, result.hp, result.mondo, result.so, result.uberon, result.hgnc);
    }

    private static <T> Runnable prepareTask(ResourceTuple<T> resource, Consumer<String> errorConsumer, CountDownLatch latch) {
        return () -> {
            try (InputStream is = new BufferedInputStream(Files.newInputStream(resource.resource))) {
                resource.resultConsumer.accept(resource.loader.apply(is));
            } catch (IOException e) {
                String message = String.format("Error parsing resource at %s: %s", resource.resource.toAbsolutePath(), e.getMessage());
                errorConsumer.accept(message);
            } finally {
                latch.countDown();
            }
            LOGGER.info("Loaded {}", resource.resource.toAbsolutePath());
        };
    }

    private static class Resources {
        private OntologyConceptResource efo;
        private OntologyConceptResource geno;
        private OntologyConceptResource hp;
        private OntologyConceptResource mondo;
        private OntologyConceptResource so;
        private OntologyConceptResource uberon;
        private ConceptResource hgnc;

        public void setEfo(OntologyConceptResource efo) {
            this.efo = efo;
        }

        public void setGeno(OntologyConceptResource geno) {
            this.geno = geno;
        }

        public void setHp(OntologyConceptResource hp) {
            this.hp = hp;
        }

        public void setMondo(OntologyConceptResource mondo) {
            this.mondo = mondo;
        }

        public void setSo(OntologyConceptResource so) {
            this.so = so;
        }

        public void setUberon(OntologyConceptResource uberon) {
            this.uberon = uberon;
        }

        public void setHgnc(ConceptResource hgnc) {
            this.hgnc = hgnc;
        }
    }

    private static class ResourceTuple<T> {
        private final Path resource;
        private final Function<InputStream, T> loader;
        private final Consumer<T> resultConsumer;

        private ResourceTuple(Path resource, Function<InputStream, T> loader, Consumer<T> resultConsumer) {
            this.resource = resource;
            this.loader = loader;
            this.resultConsumer = resultConsumer;
        }
    }

}
