package org.monarchinitiative.phenopacketlab.core.miner;

import org.monarchinitiative.phenopacketlab.model.MinedText;

public interface TextMiningService {

    MinedText mineText(String payload);

}