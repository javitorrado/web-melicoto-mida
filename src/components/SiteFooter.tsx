import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mc-footer">
      <div className="mc-footer__grid">
        <div>
          <h4>Atenció al client</h4>
          <p style={{ color: "#b9b9c0", marginBottom: "0.4rem" }}>Tel. 871 934 438</p>
          <p style={{ color: "#8a8a92", fontSize: "0.85rem" }}>
            De dilluns a divendres de 10 a 14h i de 17 a 20h. Dissabte de 10 a 14h.
          </p>
          <p style={{ color: "#8a8a92", fontSize: "0.85rem" }}>
            Carrer Blanquerna 32, 07003 Palma, Illes Balears
          </p>
          <p style={{ marginTop: "0.4rem" }}>
            <a href="mailto:info@melicoto.com">info@melicoto.com</a>
          </p>
        </div>

        <div>
          <h4>Informació</h4>
          <ul>
            <li><Link href="/melicoto">Qui som?</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/feim-pinya">Camisetes x grups</Link></li>
            <li><Link href="/contacte">Contacte</Link></li>
            <li><Link href="/tens-dubtes">Tens dubtes?</Link></li>
          </ul>
        </div>

        <div>
          <h4>Legal</h4>
          <ul>
            <li><Link href="/nota-legal-i-condicions">Nota legal i condicions</Link></li>
            <li><Link href="/politica-de-cookies-ue">Política de cookies</Link></li>
            <li><Link href="/politica-de-privacitat">Política de privacitat</Link></li>
            <li><Link href="/mapa-de-la-web">Mapa de la web</Link></li>
          </ul>
        </div>

        <div>
          <h4>Compra fàcil</h4>
          <ul>
            <li>Enviament a domicili o recollida</li>
            <li>Certificat, entre 2 i 5 dies</li>
            <li>Enviament gratuït a partir de 60€</li>
            <li>Pagament segur amb targeta</li>
          </ul>
        </div>
      </div>
      <div className="mc-footer__bottom">
        © {new Date().getFullYear()} Roqueta idees mediterrànies SL · Melicotó — cultura illenca
      </div>
    </footer>
  );
}
