import { describe, expect, it } from "vitest";
import {
  DEFAULT_HQ_COUNTRY,
  DEFAULT_HQ_STATE,
  SECTOR_LABELS,
  USE_OF_FUNDS_LABELS,
} from "./labels";

describe("human labels", () => {
  it("maps use-of-funds tags to normal grammar, not database names", () => {
    expect(USE_OF_FUNDS_LABELS.product_development).toBe("Product development");
    expect(USE_OF_FUNDS_LABELS.r_and_d).toBe("R&D");
    expect(USE_OF_FUNDS_LABELS.scale_up).toBe("Scale-up");
    expect(USE_OF_FUNDS_LABELS.commercial_growth).toBe("Commercial growth");
    expect(USE_OF_FUNDS_LABELS.manufacturing_scale).toBe("Manufacturing scale");
    expect(Object.values(USE_OF_FUNDS_LABELS).some((label) => label.includes("_"))).toBe(
      false,
    );
  });

  it("keeps United States and Utah as the intake location defaults", () => {
    expect(DEFAULT_HQ_COUNTRY).toBe("US");
    expect(DEFAULT_HQ_STATE).toBe("UT");
    expect(SECTOR_LABELS.ai).toBe("AI");
  });
});
