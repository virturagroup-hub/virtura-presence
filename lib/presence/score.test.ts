import assert from "node:assert/strict";
import test from "node:test";

import { quickScoreFixtures } from "@/lib/presence/score-fixtures";
import { buildQuickScore } from "@/lib/presence/score";

for (const fixture of quickScoreFixtures) {
  test(`quick score fixture: ${fixture.name}`, () => {
    const result = buildQuickScore(fixture.input);

    assert.ok(
      result.score >= fixture.minScore && result.score <= fixture.maxScore,
      `${fixture.name} expected score between ${fixture.minScore} and ${fixture.maxScore}, got ${result.score}`,
    );
    assert.equal(result.tier, fixture.expectedTier);
  });
}
