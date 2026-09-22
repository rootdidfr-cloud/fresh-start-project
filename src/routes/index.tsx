import { ClientOnly, createFileRoute } from "@tanstack/react-router";

import BpotApp from "../components/bpot/App";
import bpotCss from "../components/bpot/styles.css?url";
import dialogCss from "../components/bpot/dialogs.css?url";
import responsiveCss from "../components/bpot/responsive.css?url";

export const Route = createFileRoute("/")({
  head: () => ({
    links: [
      { rel: "stylesheet", href: bpotCss },
      { rel: "stylesheet", href: dialogCss },
      { rel: "stylesheet", href: responsiveCss },
    ],
  }),
  component: BpotPage,
});

function BpotPage() {
  return (
    <ClientOnly fallback={<PlaygroundLoading />}>
      <BpotApp />
    </ClientOnly>
  );
}

function PlaygroundLoading() {
  return (
    <main className="bpot-loading" aria-busy="true" aria-label="Loading Bpot">
      <div className="bpot-loading-brand">
        bpot<span>.</span>
      </div>
      <h1>The Bitcoin playground.</h1>
      <p role="status">Loading jackpots and coinflips…</p>
      <noscript>Enable JavaScript to play the Bpot demo.</noscript>
    </main>
  );
}
