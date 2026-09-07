/**
 * Renderitza HTML generat a partir del nostre Markdown (contingut de confiança,
 * escrit per l'equip de Melicotó — no entrada d'usuari).
 */
export function Prose({ html }: { html: string }) {
  return (
    <div
      className="mc-prose"
      // El contingut ve dels nostres fitxers .md, no d'usuaris.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
