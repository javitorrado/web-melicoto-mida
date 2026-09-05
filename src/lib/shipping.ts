export function calculateShipping(
  subtotal: number,
  postalCode: string
): { cost: number; blocked: boolean; reason?: string } {
  if (subtotal >= 60) {
    return { cost: 0, blocked: false };
  }

  const prefix = postalCode.slice(0, 2);

  if (["35", "38", "51", "52"].includes(prefix)) {
    return {
      cost: 0,
      blocked: true,
      reason: "No fem enviaments a Canàries, Ceuta ni Melilla.",
    };
  }

  if (prefix === "07") {
    return { cost: 6.5, blocked: false };
  }

  return { cost: 7.5, blocked: false };
}
