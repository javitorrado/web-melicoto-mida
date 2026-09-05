export default function Home() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Benvingut a Melicotó</h1>
      <p>Botiga online en construcció — fase 1 de proves de concepte.</p>
      <ul>
        <li>
          <a href="/shop/categoria-producte/textil">
            Categoria: Tèxtil
          </a>
        </li>
        <li>
          <a href="/api/products">API: Llistat de productes</a>
        </li>
      </ul>
    </div>
  );
}
