export default function CtaBand({
  title,
  text,
  href,
  cta,
}: {
  title: string;
  text: string;
  href: string;
  cta: string;
}) {
  return (
    <section className="cta-band">
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <a className="button" href={href}>
        {cta}
      </a>
    </section>
  );
}
