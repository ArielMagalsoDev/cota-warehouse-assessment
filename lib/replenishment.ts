import type { OpenShelf, Product } from "./types.ts";

export type Replenishment = {
  unitsNeeded: number;
  casesToPull: number;
  unitsPulled: number;
  leftoverUnits: number;
  availableCases: number;
  shortCases: number;
};

export function calculateReplenishment(product: Product, shelf: OpenShelf, availableCases: number): Replenishment {
  const unitsNeeded = Math.max(0, shelf.capacity_units - shelf.current_units);
  const casesToPull = Math.ceil(unitsNeeded / product.units_per_case);
  const unitsPulled = casesToPull * product.units_per_case;
  return {
    unitsNeeded,
    casesToPull,
    unitsPulled,
    leftoverUnits: unitsPulled - unitsNeeded,
    availableCases,
    shortCases: Math.max(0, casesToPull - availableCases),
  };
}
