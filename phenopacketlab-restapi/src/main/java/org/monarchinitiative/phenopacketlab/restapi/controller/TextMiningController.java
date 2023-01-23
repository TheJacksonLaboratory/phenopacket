package org.monarchinitiative.phenopacketlab.restapi.controller;

import org.monarchinitiative.phenopacketlab.core.miner.TextMiningService;
import org.monarchinitiative.phenopacketlab.model.MinedText;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping(value = "${api.version}/textminer", method = RequestMethod.POST)
@CrossOrigin(origins = "http://localhost:4200")
public class TextMiningController {

    private final TextMiningService textMiningService;

    public TextMiningController(TextMiningService textMiningService) {
        this.textMiningService = textMiningService;
    }

    @GetMapping
    public ResponseEntity<MinedText> minedText(@RequestBody String payload) {
        if (payload == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        return ResponseEntity.ok(textMiningService.mineText(payload));
    }

}