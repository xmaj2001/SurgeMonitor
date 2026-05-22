export function Footer() {
  return (
    <footer className="" id="footer">
      <div className="mx-auto max-w-7xl px-6 py-10 grid gap-6 md:grid-cols-3 text-sm text-muted-foreground">
        <div>
          <div className="font-serif text-xl text-foreground">
            Surge Monitor
          </div>
          <p className="mt-2">
            A tool for tracking disease outbreaks and public health emergencies
            around the world.
          </p>
        </div>
        <div>
          <div className="uppercase tracking-widest text-[10px] mb-2">
            Sources
          </div>
          <ul className="space-y-1">
            <li>
              <a
                className="hover:underline"
                href="https://www.who.int/emergencies/disease-outbreak-news"
                target="_blank"
                rel="noreferrer"
              >
                WHO Disease Outbreak News
              </a>
            </li>
            <li>
              <a
                className="hover:underline"
                href="https://www.who.int/data/gho/info/gho-odata-api"
                target="_blank"
                rel="noreferrer"
              >
                WHO Global Health Observatory (GHO)
              </a>
            </li>
          </ul>
        </div>
        <div>
          <div className="uppercase tracking-widest text-[10px] mb-2">
            Disclaimer
          </div>
          <p>
            Not affiliated with the WHO. All outbreak content is republished
            from public WHO sources for editorial and humanitarian use.
          </p>
        </div>
      </div>
    </footer>
  );
}
