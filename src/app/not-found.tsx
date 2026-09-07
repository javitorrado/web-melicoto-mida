import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>404 &mdash; Pàgina no trobada</h1>
      <p>Disculpa, la pàgina que busques no existeix.</p>
      <Link href="/" style={{ color: "var(--color-primary)" }}>Tornar a l&apos;inici</Link>
    </div>
  );
}
