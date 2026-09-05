"use client";

import { useCart } from "@/lib/cart-context";
import { calculateShipping } from "@/lib/shipping";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export function CheckoutPageClient() {
  const { items, subtotal } = useCart();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    deliveryMethod: "pickup",
    address: "",
    postalCode: "",
    city: "",
  });

  const [shippingError, setShippingError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <h1>Checkout — Carret buit</h1>
        <p>Afegeix productes primer.</p>
        <Link href="/carret" style={{ color: "#007bff", textDecoration: "none" }}>
          Tornar al carret
        </Link>
      </div>
    );
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, postalCode: value }));

    if (formData.deliveryMethod === "delivery" && value) {
      const { blocked, reason } = calculateShipping(subtotal, value);
      if (blocked) {
        setShippingError(reason || "No es pot fer enviament a aquesta zona.");
      } else {
        setShippingError(null);
      }
    }
  };

  const { cost: shippingCost, blocked: shippingBlocked } = calculateShipping(
    subtotal,
    formData.postalCode
  );
  const total =
    subtotal + (formData.deliveryMethod === "delivery" ? shippingCost : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (formData.deliveryMethod === "delivery" && shippingBlocked) {
      setError("No es pot fer enviament a aquesta zona.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          },
          deliveryMethod: formData.deliveryMethod,
          address:
            formData.deliveryMethod === "delivery"
              ? {
                  address: formData.address,
                  postalCode: formData.postalCode,
                  city: formData.city,
                }
              : null,
          shippingCost: formData.deliveryMethod === "delivery" ? shippingCost : 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la comanda");
      }

      const data = await response.json();
      router.push(
        `/comanda-confirmada?orderId=${data.orderId}&orderRef=${data.orderRef}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconegut");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Checkout</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "2rem" }}>
        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <fieldset style={{ border: "none", padding: 0 }}>
            <legend style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem" }}>
              Dades personals
            </legend>
            <div style={{ display: "grid", gap: "1rem" }}>
              <input
                type="text"
                placeholder="Nom"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                }
                style={{
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
              <input
                type="text"
                placeholder="Cognoms"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
                style={{
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
              <input
                type="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                style={{
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
              <input
                type="tel"
                placeholder="Telèfon"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                style={{
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>
          </fieldset>

          <fieldset style={{ border: "none", padding: 0 }}>
            <legend style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem" }}>
              Entrega
            </legend>
            <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="radio"
                  value="pickup"
                  checked={formData.deliveryMethod === "pickup"}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, deliveryMethod: e.target.value }))
                  }
                />
                Recollida a botiga (gratis)
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="radio"
                  value="delivery"
                  checked={formData.deliveryMethod === "delivery"}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, deliveryMethod: e.target.value }))
                  }
                />
                Enviament a domicili
              </label>
            </div>

            {formData.deliveryMethod === "delivery" && (
              <div style={{ display: "grid", gap: "1rem", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                <input
                  type="text"
                  placeholder="Adreça"
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                />
                <input
                  type="text"
                  placeholder="Codi postal"
                  required
                  value={formData.postalCode}
                  onChange={handleAddressChange}
                  style={{
                    padding: "0.75rem",
                    border: `1px solid ${shippingBlocked ? "#dc3545" : "#ddd"}`,
                    borderRadius: "4px",
                    backgroundColor: shippingBlocked ? "#f8d7da" : "white",
                  }}
                />
                <input
                  type="text"
                  placeholder="Ciutat"
                  required
                  value={formData.city}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, city: e.target.value }))
                  }
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                />

                {shippingError && (
                  <div
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "#f8d7da",
                      color: "#721c24",
                      borderRadius: "4px",
                      border: "1px solid #f5c6cb",
                    }}
                  >
                    ⚠️ {shippingError}
                  </div>
                )}
              </div>
            )}
          </fieldset>

          {error && (
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#f8d7da",
                color: "#721c24",
                borderRadius: "4px",
                border: "1px solid #f5c6cb",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (formData.deliveryMethod === "delivery" && shippingBlocked)}
            style={{
              padding: "1rem",
              backgroundColor:
                loading || (formData.deliveryMethod === "delivery" && shippingBlocked)
                  ? "#ccc"
                  : "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading || (formData.deliveryMethod === "delivery" && shippingBlocked) ? "not-allowed" : "pointer",
              fontWeight: "bold",
              marginTop: "1rem",
            }}
          >
            {loading ? "Processant..." : "Crear comanda"}
          </button>
        </form>

        {/* Resum */}
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            height: "fit-content",
          }}
        >
          <h3>Resum de la comanda</h3>
          <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
            {items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <div>
                  <div>{item.label}</div>
                  {item.variantLabel && (
                    <div style={{ fontSize: "0.85rem", color: "#666" }}>
                      {item.variantLabel}
                    </div>
                  )}
                  <div style={{ fontSize: "0.85rem", color: "#999" }}>
                    x{item.qty}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {(item.price * item.qty).toFixed(2)}€
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "2px solid #ddd", paddingTop: "1rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span>Subtotal:</span>
              <span>{subtotal.toFixed(2)}€</span>
            </div>

            {formData.deliveryMethod === "delivery" && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <span>Enviament:</span>
                <span>{shippingCost > 0 ? `${shippingCost.toFixed(2)}€` : "Gratuït"}</span>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                fontSize: "1.2rem",
                marginTop: "1rem",
                paddingTop: "1rem",
                borderTop: "2px solid #ddd",
              }}
            >
              <span>Total:</span>
              <span>{total.toFixed(2)}€</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <Link href="/carret" style={{ color: "#007bff", textDecoration: "none" }}>
          Tornar al carret
        </Link>
      </div>
    </div>
  );
}
