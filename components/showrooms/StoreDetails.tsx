"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { contactLinks, hoursState } from "@/lib/showrooms/domain";
import type { Store } from "@/lib/showrooms/types";
import { cityKey } from "@/lib/showrooms/locations";
export function trackStore(action: string, id: string, context?: { country_code: string; city: string }) {
  if (
    process.env.NODE_ENV !== "production" ||
    location.hostname !== "www.chairpedia.com"
  )
    return;
  const w = window as typeof window & {
    gtag?: (
      command: string,
      event: string,
      params: Record<string, string>,
    ) => void;
  };
  w.gtag?.("event", "showroom_action", {
    action, store_id: id,
    ...(context ? { country_code: context.country_code, city: context.city } : {}),
  });
}
export function StoreDetails({ store: s, correctionsEnabled = true }: { store: Store; correctionsEnabled?: boolean }) {
  const tracked = useRef("");
  useEffect(() => {
    if (tracked.current !== s.id) {
      tracked.current = s.id;
      trackStore("detail_open", s.id, s);
    }
  }, [s]);
  const [now, setNow] = useState<Date | null>(null),
    [feedback, setFeedback] = useState(""),
    [sending, setSending] = useState(false);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  const hours = now ? hoursState(s.hours, s.timezone, now) : null;
  return (
    <article className="atlas-detail">
      <p className="atlas-kicker">
        {s.city} · {s.country_code}
      </p>
      <h1>{s.name}</h1>
      <p>
        Chair store ·{" "}
        {s.appointment === "required"
          ? "Appointment required"
          : s.appointment === "walk_in"
            ? "Walk-ins welcome"
            : "Visit arrangements unconfirmed"}
      </p>
      <address>
        {s.address}
        {s.unit ? `, ${s.unit}` : ""}
        <br />
        {s.city}, {s.region} {s.country_code}
      </address>
      <div className="atlas-actions">
        {contactLinks(s).map((a) => (
          <a
            key={a.kind}
            href={a.href}
            onClick={() => trackStore(a.kind, s.id, s)}
            {...(a.href.startsWith("http")
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {a.label} ↗
          </a>
        ))}
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                [s.address, s.unit, s.city, s.country_code]
                  .filter(Boolean)
                  .join(", "),
              );
              setFeedback("Address copied");
            } catch {
              setFeedback(
                "Could not copy. Select the address above to copy it.",
              );
            }
          }}
        >
          Copy address
        </button>
      </div>
      {(s.phone || s.email) && (
        <p className="atlas-contact-info">
          {s.phone && <>Phone: {s.phone}</>}
          {s.phone && s.email && <br />}
          {s.email && <>Email: {s.email}</>}
        </p>
      )}
      {!!s.photos.length && (
        <div className="atlas-photos">
          {s.photos.map((p) => (
            <figure key={p.url}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`${s.name} showroom`} loading="lazy" />
              <figcaption>{p.credit}</figcaption>
            </figure>
          ))}
        </div>
      )}
      <section>
        <h2>Plan your visit</h2>
        <p>
          {s.visit_notes || "Contact the store to confirm visit arrangements."}
        </p>
      </section>
      {s.transport_notes && (
        <section>
          <h2>Getting there</h2>
          <p>{s.transport_notes}</p>
        </section>
      )}
      <section>
        <h2>Opening hours</h2>
        <p>
          {hours?.state === "open"
            ? "Open now"
            : hours?.state === "closed"
              ? "Closed now"
              : "Opening status unconfirmed"}
          {s.timezone ? ` · ${s.timezone}` : ""}
        </p>
        {s.appointment === "required" && (
          <p>
            Opening hours do not guarantee walk-in access. Arrange an
            appointment.
          </p>
        )}
        {!!Object.keys(s.hours.weekly).length && <dl>
          {[
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ].map((d, i) => (
            <div key={d}>
              <dt>{d}</dt>
              <dd>
                {s.hours.weekly[String(i)] === undefined ||
                s.hours.weekly[String(i)] === null
                  ? "Unconfirmed"
                  : s.hours.weekly[String(i)]!.length
                    ? s.hours.weekly[String(i)]!.map(
                        (p) =>
                          `${p.open}–${p.close}${p.close <= p.open ? " (+1 day)" : ""}`,
                      ).join(", ")
                    : "Closed"}
              </dd>
            </div>
          ))}
        </dl>}
        <p>Times are local. Holiday hours and displays may change; confirm before travelling.</p>
        {!!Object.keys(s.hours.exceptions).length && (
          <details>
            <summary>Special dates and holiday hours</summary>
            <ul>
              {Object.entries(s.hours.exceptions)
                .sort()
                .map(([d, ps]) => (
                  <li key={d}>
                    {d}:{" "}
                    {ps === null
                      ? "Unconfirmed"
                      : ps.length
                        ? ps
                            .map(
                              (p) =>
                                `${p.open}–${p.close}${p.close <= p.open ? " (+1 day)" : ""}`,
                            )
                            .join(", ")
                        : "Closed"}
                  </li>
                ))}
            </ul>
          </details>
        )}
      </section>
      <section>
        <h2>Brands at this store</h2>
        {s.brands.length ? (
          <ul>
            {s.brands.map((b) => (
              <li key={b.brand_id}>
                {b.slug ? (
                  <Link href={`/brands/${b.slug}`} onClick={() => trackStore("research_brand", s.id)}>
                    {b.name || "Brand"}
                  </Link>
                ) : (
                  b.name || "Brand"
                )}{" — "}
                {b.carried === "confirmed"
                  ? "Brand carried"
                  : b.carried === "unavailable"
                    ? "Not carried"
                    : "Unconfirmed"}
                {b.official === "confirmed" ? " · Official dealer" : ""}
                {b.source_url && (
                  <>
                    {" "}
                    ·{" "}
                    <a
                      href={b.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Source
                    </a>
                  </>
                )}
                {b.checked_on && ` · Checked ${b.checked_on}`}
              </li>
            ))}
          </ul>
        ) : (
          <p>Brand information unconfirmed.</p>
        )}
      </section>
      <section>
        <h2>Chairs to try</h2>
        <p>
          Brand carried does not confirm a model is on display or in stock.
          Confirm availability before travelling.
        </p>
        {s.models.length ? (
          <ul>
            {s.models.map((m) => (
              <li key={m.product_id}>
                {m.slug ? (
                  <Link href={`/products/${m.slug}`}>{m.name}</Link>
                ) : (
                  m.name || "Chair"
                )}{" "}
                —{" "}
                {m.trial === "confirmed"
                  ? "Confirmed to try"
                  : m.trial === "unavailable"
                    ? "Not available to try"
                    : "Ask first"}
                {m.source_url && (
                  <>
                    {" "}
                    ·{" "}
                    <a
                      href={m.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Source
                    </a>
                  </>
                )}
                {m.checked_on && ` · Checked ${m.checked_on}`}
                {m.slug && m.trial === "confirmed" && (
                  <>{" · "}<Link href={`/stores/try/${m.slug}/${cityKey(s)}`} onClick={() => trackStore("research_trial_page", s.id)}>Other places to try</Link></>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No exact models confirmed yet.</p>
        )}
      </section>
      <section className="atlas-research">
        <p className="atlas-kicker">RESEARCH BEFORE YOU VISIT</p>
        <h2>Shortlist the right chairs first</h2>
        <p>
          Compare specifications and buying advice before contacting the store,
          then ask which exact configurations are available to try.
        </p>
        <div className="atlas-actions">
          <Link href="/products" onClick={() => trackStore("research_products", s.id)}>
            Browse chair specifications
          </Link>
          <Link href="/compare" onClick={() => trackStore("research_compare", s.id)}>
            Compare chair models
          </Link>
          <Link href="/best/best-chairs-to-buy" onClick={() => trackStore("research_best", s.id)}>
            See the best chairs to buy
          </Link>
        </div>
      </section>
      <p>
        Information checked {s.checked_on || "date unconfirmed"}.{" "}
        {s.source_url && (
          <a href={s.source_url} target="_blank" rel="noopener noreferrer">
            Information source ↗
          </a>
        )}
      </p>
      {correctionsEnabled ? <details>
        <summary>Suggest a correction</summary>
        <p>
          Your report is reviewed before any store information changes. Contact
          details are not published.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setSending(true);
            const form = e.currentTarget,
              fd = new FormData(form);
            try {
              const r = await fetch("/api/showrooms/corrections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  showroom_id: s.id,
                  message: fd.get("message"),
                  requester_email: fd.get("email"),
                  website: fd.get("website"),
                }),
              });
              if (!r.ok) throw new Error();
              setFeedback("Correction sent for review.");
              form.reset();
            } catch {
              setFeedback("Could not send your report. Please try again.");
            } finally {
              setSending(false);
            }
          }}
        >
          <label>
            What needs correcting?
            <textarea name="message" required minLength={10} maxLength={3000} />
          </label>
          <label>
            Email (optional)
            <input name="email" type="email" maxLength={254} />
          </label>
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ display: "none" }}
          />
          <button disabled={sending}>
            {sending ? "Sending…" : "Send correction"}
          </button>
        </form>
      </details> : <p><Link href="/contact">Suggest a correction</Link> — include the store name and the information to update.</p>}
      <p role="status">{feedback}</p>
    </article>
  );
}
