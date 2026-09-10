# Cuneiform Explorer — MVP 0.4.1 + 0.5 + 0.6

Dieses Paket enthält drei Seiten der Anwendung:

- **`index.html`** — Landing Page / Tafel-Übersetzung (MVP 0.5): der Fokus der App. Ein oder mehrere Fotos
  einer Tafel hochladen — Sprache, Zeichen und Übersetzung werden automatisch von der KI ermittelt und in
  einem Ergebnis angezeigt. Bewusst ohne Zeichenarchiv auf der Startseite, damit der Foto-Upload nicht mit
  anderen Inhalten konkurriert.
- **`archiv.html`** — Zeichenarchiv (MVP 0.4.1): vollständige OSL-Datenbank, Suche, Detailansicht, Sprachen-/
  Epochenfilter (MVP 0.4.2).
- **`woerterbuch.html`** — Begriffs-Wörterbuch (MVP 0.6, neu): deutschen Begriff eingeben, passende Zeichen und
  Bedeutungen aus dem kuratierten Kurzglossar finden, optional KI-Vorschläge für weitere Keilschriftsprachen
  anfragen.

Alle drei Seiten sind über die Navigation oben rechts gegenseitig verlinkt, teilen sich `data/signs.osl.json`
sowie die restlichen `data/*.json`-Dateien, und laden gemeinsam `gamify.js` für das seitenübergreifende
Fortschritts-/Gamification-System (siehe Abschnitt „Fortschritt & Gamification“ unten).

---

## MVP 0.5 — Tafel-Übersetzung mit KI-Unterstützung

### Ablauf in `index.html`

Bewusst auf einen einzigen, einfachen Ablauf reduziert:

1. **Fotos hochladen** — ein oder mehrere Aufnahmen derselben Tafel (per Klick oder Drag & Drop). Jedes Foto
   lässt sich per Klick um 90° drehen oder wieder entfernen.
2. **„Tafel übersetzen“ klicken** — alle Fotos gehen in **einer** Anfrage an ein multimodales KI-Modell (über
   OpenRouter). Es identifiziert **jedes erkennbare Keilschriftzeichen der gesamten Tafel** (nicht nur einen
   Ausschnitt), bestimmt die wahrscheinliche Sprache, transliteriert und übersetzt vollständig ins Deutsche.
   Beschädigte oder unleserliche Stellen werden auf Basis von Wahrscheinlichkeit ergänzt, um Sinnhaftigkeit
   herzustellen — aber jede Ergänzung wird klar als solche markiert statt stillschweigend als sicher
   dargestellt zu werden (siehe „Vollständigkeit & Markierung ergänzter Textstellen“ unten).
3. **Ergebnis** — direkt danach angezeigt:
   - die wahrscheinlichste(n) Sprache(n) als Chips (mit Prozentangabe),
   - die deutsche Übersetzung in großer Schrift, **frei editierbar** (Textfeld) — ergänzte/vermutete Stellen
     stehen dabei in **[eckigen Klammern]**,
   - die erkannten Einzelzeichen als anklickbare Zeichen-Chips: Klick öffnet die Detailansicht aus dem
     Zeichenbrowser (Glyph, Lesungen, Zeichenlisten), sofern der Name in der lokalen OSL-Datenbank existiert;
     sonst „kein Treffer in lokaler OSL-Datenbank“ statt eines erfundenen Zeichens. Zusätzlich zeigt die
     Detailansicht — falls von der KI angegeben — die **kontextuelle Lesung** neben der einfachen Lesung
     (Konzeptdokument Abschnitt 15: ein Zeichen wird nicht einfach mit einer Bedeutung gleichgesetzt, sondern
     „erkannt“ und „im Kontext interpretiert“ getrennt ausgewiesen) sowie den **Status** „✓ erkannt“ oder
     „⋯ ergänzt/vermutet“ mit Begründung,
   - Anmerkungen/Unsicherheiten (z. B. zu Ergänzungen oder unlesbaren Lücken) als Hinweisbox,
   - unter „Grabungsprotokoll“ (Details anzeigen) zusätzlich Transliteration, eine **Wortanalyse** (Wort-für-Wort-
     Bedeutungen der Transliteration, Konzeptdokument Abschnitt 16 „Ebene 2“) und eine wörtlichere Übersetzung,
     alle editierbar.
4. **Weiter bearbeiten** — Übersetzung kopieren, als Textdatei speichern (inkl. Wortanalyse), oder
   „Neu analysieren“ für einen erneuten Versuch (z. B. nach Foto-Wechsel).

Die OSL-Zuordnung der Zeichen-Chips ist rein informativ (zeigt die echte Glyphe, wenn der KI-Name in der
Datenbank existiert) und blockiert nichts — die KI-Übersetzung erscheint immer sofort, ganz ohne
Bestätigungsschritte.

### Vollständigkeit & Markierung ergänzter Textstellen

Zwei häufige Kritikpunkte an früheren Versionen wurden gezielt adressiert:

- **Vollständigkeit statt Ausschnitt:** Der KI-Prompt verlangt jetzt ausdrücklich, wirklich **jedes** auf den
  Fotos erkennbare Zeichen zu transliterieren und zu übersetzen — über die gesamte Tafel bzw. alle
  hochgeladenen Seiten/Kolonnen hinweg, nicht nur eine Zusammenfassung oder die ersten Zeilen. Das Token-Budget
  der Anfrage wurde entsprechend erhöht, damit auch längere Texte vollständig in einer Antwort Platz finden.
- **Ergänzter Text ist erlaubt, aber immer markiert:** Wo Zeichen beschädigt, unleserlich oder mehrdeutig sind,
  darf und soll die KI auf Basis von Wahrscheinlichkeit ergänzen (üblicher Kontext, typische Formulierungen,
  um Sinnhaftigkeit herzustellen) — das ist ausdrücklich erwünscht, muss aber immer erkennbar bleiben:
  - In Transliteration und beiden Übersetzungen wird ergänzter/vermuteter Text nach der in der Assyriologie
    gebräuchlichen Konvention in **[eckige Klammern]** gesetzt; direkt abgelesener Text bleibt unmarkiert.
  - Jedes einzelne Zeichen trägt zusätzlich einen Status: **„erkannt“** (direkt und sicher vom Foto gelesen)
    oder **„ergänzt“** (durch Wahrscheinlichkeit/Kontext rekonstruiert) — mit kurzer Begründung. Ergänzte
    Zeichen erscheinen im Ergebnis mit gestricheltem Rahmen und der Kennzeichnung „ergänzt“; die Detailansicht
    zeigt Status und Begründung aus.
  - Eine Legende direkt über der Übersetzung erklärt diese Konvention.

Damit bleibt der Kernsatz des Konzeptdokuments (Abschnitt 32, „Unsicherheit ist ein Feature“) auch bei
vollständiger Abdeckung der Tafel gewahrt: Ergänzungen sind erlaubt und nützlich, aber nie von echten Lesungen
zu unterscheiden.

### Genauigkeit der Spracherkennung — Bugfix gegen Sumerisch/Akkadisch-Bias

**Gemeldeter Fehler:** Eine tatsächlich altpersische Keilschrifttafel wurde von der KI als „Sumerisch“ erkannt.

**Ursache:** Der bisherige System-Prompt öffnete mit „Assistenz für Keilschrift (Sumerisch, Akkadisch und
verwandte Sprachen)“ — diese Formulierung allein grundiert ein Sprachmodell bereits auf Sumerisch/Akkadisch,
bevor es das Bild überhaupt sieht. Dazu kommt ein bekannter, modellübergreifender Bias: Sumerisch und Akkadisch
sind im Trainingsmaterial der meisten KI-Modelle bei weitem am stärksten vertreten, wenn von „Keilschrift“ die
Rede ist — andere Keilschrift-Sprachen wie Altpersisch (ein eigenständiges, deutlich vereinfachtes System mit
nur ca. 36 Zeichen) oder Ugaritisch (ein alphabetisches System mit ca. 30 Zeichen) werden dadurch tendenziell
übersehen, obwohl sie sich in Zeichenanzahl und -komplexität stark von Sumerisch/Akkadisch unterscheiden.

**Fix:** Der System-Prompt wurde grundlegend überarbeitet:
- Die einleitende Formulierung nennt keine Sprache mehr vorab, sondern spricht neutral von „Keilschrift-
  Schriftsystemen“.
- Eine neue, explizite Anweisung verbietet reflexhaftes Raten („NIE nur, weil es Keilschrift ist“) und listet
  für alle sieben nicht-mesopotamischen und die mesopotamischen Keilschrift-Sprachgruppen kurz die sichtbaren
  Unterscheidungsmerkmale auf (ungefähre Zeichenanzahl, Zeichenkomplexität, Ableitungsverhältnis) — dieselben
  Fakten, die bereits kuratiert in `data/languages.json` stehen (`script_type_de`), hier zusätzlich direkt in
  den KI-Prompt eingebettet, damit das Modell sie beim Betrachten des Fotos aktiv abwägt, statt sie zu ignorieren.
- Ein neues Antwortfeld `language_reasoning` verlangt von der KI eine kurze, auf sichtbaren Merkmalen (Zahl
  unterschiedlicher Zeichenformen, Komplexität, Layout, Textträger) basierende Begründung ihrer Sprachwahl —
  nicht nur ein Label. Diese Begründung wird direkt im Ergebnis unter den Sprach-Chips angezeigt, mit dem
  Hinweis, bei unplausibler Begründung „Neu analysieren“ zu probieren — die Sprachbestimmung ist der unsicherste
  Teil der automatischen Analyse und wird jetzt entsprechend transparent gemacht, statt eine einzelne
  KI-Vermutung unkommentiert als Faktum darzustellen (Konzeptdokument Abschnitt 32).
- Die Bildauflösung, die an die KI geschickt wird, wurde leicht erhöht (1500px → 1800px maximale Kantenlänge),
  damit feine Zeichendetails (Anzahl/Winkel einzelner Keileindrücke) besser erkennbar sind.

Ein Playwright-Regressionstest sichert ab, dass der Prompt die Anti-Bias-Hinweise und alle relevanten Sprachen
weiterhin enthält und dass `language_reasoning` im Ergebnis angezeigt wird.

**Recherchierte, aber (bewusst) nicht integrierte Datenbanken:** Auf Wunsch wurde die
[electronic Babylonian Library (eBL)](https://www.ebl.lmu.de) der LMU München geprüft, ob sie sich einbinden
lässt:
- Die eBL-API (`ebl-api` auf GitHub) verwaltet Fragmente, Lexikon-/Wörterbucheinträge und Zeichenlisten, ist
  aber über Auth0 zugangsbeschränkt (Scopes wie `transliterate:fragments`) — eine Live-Einbindung würde ein
  eigenes Nutzerkonto/Login voraussetzen, was dem bisherigen „installationsfrei, kein Konto nötig“-Prinzip
  dieser App widersprechen würde.
- Für die eigentliche Bild-Zeichenerkennung betreibt eBL ein separates, selbst gehostetes Deep-Learning-Modell
  (`ebl-ai-api`, FCENet/MMOCR-basiert) — das bestätigt, dass zuverlässige Zeichen-Erkennung aus Fotos ein
  eigenständiges Computer-Vision-Problem ist, für das eBL ein dediziertes, trainiertes Modell mit eigenem
  Backend einsetzt. Das passt architektonisch nicht zu dieser App (bewusst rein clientseitig, kein eigener
  Server, siehe Konzeptdokument) und wäre auch mit dem zugehörigen Trainingsdatensatz (ca. 159.000 Zeichen-
  Ausschnitte, ~11 GB, CC BY-NC 4.0 — nicht-kommerziell) nicht praktikabel im Browser ladbar.
- Ehrliches Fazit statt stillschweigendem Weglassen: Diese App verwendet bewusst ein allgemeines multimodales
  KI-Modell statt eines spezialisierten, trainierten Zeichenerkennungs-Modells wie bei eBL — das ist der Preis
  der rein clientseitigen, konto- und backendfreien Architektur. Die oben beschriebene Prompt-Überarbeitung
  (explizite Unterscheidungsmerkmale, sichtbare Begründungspflicht) ist der im Rahmen dieser Architektur
  realistisch erreichbare Genauigkeitsgewinn — eine Genauigkeit auf dem Niveau eines dedizierten, auf
  Zehntausenden echten Keilschriftfotos trainierten Fachmodells ist damit nicht erreichbar und wird hier
  bewusst nicht versprochen.

### Nahaufnahme-Kachelung — zusätzliche Zeichenerkennung mit mehr Detail

Zusätzlich zur oben beschriebenen Prompt-Überarbeitung wurde eine strukturelle Verbesserung ergänzt, die dem
Ansatz spezialisierter Systeme (erst Zeichen im Bild lokalisieren, dann einzeln erkennen — siehe Recherche oben)
näherkommt, ohne die clientseitige Architektur zu verlassen:

- Nach der eigentlichen Haupterkennung (Sprache, vollständige Transliteration, Übersetzung — wie bisher anhand
  des auf max. 1800px verkleinerten Gesamtbilds) wird jedes ausreichend große Originalfoto (ab ca. 2000px
  Kantenlänge; kleinere Fotos profitieren nicht vom Zuschneiden und werden übersprungen) automatisch in bis zu
  neun überlappende Nahaufnahme-Kacheln zerlegt (Overlap ca. 15 %, damit kein Zeichen exakt auf einer
  Kachelgrenze zerschnitten wird) — aus dem Original, nicht aus dem bereits verkleinerten Gesamtbild, damit
  tatsächlich mehr Bilddetail pro Zeichen zur Verfügung steht.
- Jede Kachel wird einzeln (begrenzt auf max. 6 Kacheln pro Analyse, um das Anfragevolumen bei kostenlosen,
  ratenlimitierten Modellen nicht zu sprengen) mit einem eigenen, bewusst engen Prompt geprüft: „welche Zeichen
  sind in diesem Ausschnitt sicher erkennbar“ — keine Sprachbestimmung, keine Übersetzung, keine Vermutungen bei
  unklaren Formen auf Kachelebene.
- Zeichen, die dabei gefunden werden, aber in der Haupterkennung NICHT enthalten waren, erscheinen im Ergebnis
  als eigener, klar getrennter Abschnitt „🔬 Zusätzlich in Nahaufnahmen erkannt“ — bewusst NICHT automatisch in
  Transliteration oder Übersetzung eingemischt (das bleibt weiterhin ausschließlich das Ergebnis der
  Haupterkennung, die den vollständigen Kontext der Tafel sieht), sondern als Fund zur manuellen Prüfung/
  Ergänzung, mit Glyphen-Abgleich gegen die lokale OSL-Datenbank wie bei den übrigen Zeichen-Chips.
- Läuft vollautomatisch nach der Haupterkennung, ohne zusätzlichen Klick; schlägt eine einzelne Kachel-Anfrage
  fehl (z. B. weil gerade kein Modell erreichbar ist), wird sie stillschweigend übersprungen — das bereits
  angezeigte Hauptergebnis bleibt davon unberührt.

**Ehrliche Einordnung:** Das ist kein Ersatz für ein trainiertes Objekterkennungsmodell (siehe Recherche zu
eBL oben) — es nutzt weiterhin dasselbe allgemeine multimodale KI-Modell, nur mit kleineren, höher aufgelösten
Bildausschnitten statt einem großen, herunterskalierten Gesamtbild. Das kann zusätzliche Zeichen sichtbar
machen, die im Gesamtbild zu klein/undeutlich waren — löst aber nicht das in der Recherche beschriebene
Grundproblem einer flach beleuchteten Aufnahme ohne Schattenwurf in den Keilkerben (siehe Foto-/Lichttipps,
die aktuell noch nicht in der Oberfläche selbst angezeigt werden).

### Selbstprüfung & Mehrfach-Abstimmung (Ensemble) — Kreuzprüfung des Ergebnisses

Auf Nachfrage „welche weiteren Möglichkeiten für eine bessere Erkennung gibt es noch?" wurden zwei weitere,
unabhängig voneinander laufende Zusatzprüfungen ergänzt, die automatisch nach der Nahaufnahme-Kachelung
starten (ebenfalls ohne zusätzlichen Klick):

1. **Selbstprüfung (zwei Durchgänge):** Dieselben Fotos werden dem Modell ein zweites Mal vorgelegt, zusammen
   mit der Liste der beim ersten Durchgang gelesenen Zeichen. Das Modell wird gebeten, jedes Zeichen erneut
   gegen das Foto zu prüfen — Zeichen, bei denen es sich jetzt NICHT mehr sicher ist (z. B. Verwechslungsgefahr
   mit einem ähnlichen Zeichen), werden markiert; zusätzlich sicher erkennbare, beim ersten Durchgang gefehlte
   Zeichen werden als Zusatzfund gemeldet.
2. **Mehrfach-Abstimmung (Ensemble):** Dieselben Fotos werden zusätzlich einem ZWEITEN, unabhängigen Modell
   vorgelegt (bewusst ein anderes als das erfolgreiche Modell der Haupterkennung), ohne Kenntnis des ersten
   Ergebnisses. Zeichen, die das zweite Modell nicht bestätigt, werden ebenfalls markiert; Zeichen, die nur das
   zweite Modell findet, erscheinen als Zusatzfund.

Beide Prüfungen ergänzen nur — nichts wird automatisch in Transliteration oder Übersetzung verändert. Zeichen,
die von einer der beiden Prüfungen nicht bestätigt wurden, erhalten im Hauptergebnis ein Hinweis-Badge
„⚠ abweichend"; ein Klick auf das Zeichen zeigt im Detailfenster, welche Prüfung(en) die Abweichung gemeldet
haben und mit welcher Begründung.

**Ehrliche Einordnung — das ist ein Hinweis, kein Fehlerbeweis:** Freie OpenRouter-Modelle unterscheiden sich
stark in Fähigkeit und Konsistenz. Ein „⚠ abweichend"-Badge kann bedeuten, dass die Haupterkennung tatsächlich
falsch lag — es kann aber genauso gut bedeuten, dass das zweite (Ensemble-)Modell schwächer, weniger vollständig
oder bei diesem konkreten Foto einfach ungenauer war. Beide Zusatzprüfungen verdoppeln bzw. verdreifachen die
Anzahl der Anfragen pro Analyse (Haupterkennung + Selbstprüfung + Mehrfach-Abstimmung, zusätzlich zu den bis zu
6 Kachel-Anfragen), was bei kostenlosen, ratenlimitierten Modellen das Risiko eines Rate-Limits weiter erhöht;
schlägt eine der beiden Zusatzprüfungen komplett fehl (z. B. weil kein zweites Modell mehr verfügbar ist), wird
sie stillschweigend übersprungen — das bereits angezeigte Hauptergebnis bleibt davon unberührt.

### Zeichensegmentierung im Browser (SAM) — Klick-zu-Segmentieren, experimentell

Als dritte Option wurde außerdem eine browserbasierte Zeichensegmentierung mit **SAM2** (Segment Anything Model
2, Meta) angefragt. Die weitere Recherche dazu ergab zwei wichtige Einschränkungen gegenüber der ursprünglichen
Einschätzung, die den tatsächlichen Umfang dieser Funktion bestimmt haben:

- Es gibt aktuell **kein fertiges, per CDN einbindbares SAM2** für den Browser — echte SAM2-WebGPU-Projekte
  (z. B. `webgpu-sam2`) brauchen einen eigenen Dev-Build der ONNX-Runtime, manuelle Modellkonvertierung und ein
  eigenes Build-Toolchain-Setup; das lässt sich nicht in eine einzelne, installationsfreie HTML-Datei einbinden.
- Die in Browsern tatsächlich per fertiger Bibliothek (`@huggingface/transformers`) nutzbare Variante ist das
  ältere **SAM (Version 1)** — und das segmentiert grundsätzlich nur **einen zusammenhängenden Bereich an genau
  einem angeklickten Punkt**, nicht automatisch „alle Zeichen im ganzen Bild" auf einmal (dafür müsste man ein
  Rasterpunkt-Verfahren komplett selbst nachbauen — ein eigener, ungetesteter Bildverarbeitungs-Algorithmus statt
  einer fertigen, dokumentierten Bibliotheksfunktion; das war mir zu unsicher, um es ungeprüft auszuliefern).

Umgesetzt wurde daher eine ehrliche, kleinere Version, die auf der tatsächlich real existierenden, dokumentierten
Funktion aufbaut: **„🎯 Zeichen präzise ausschneiden (SAM, experimentell)"**, sichtbar direkt unter dem
Übersetzungsergebnis, aber **nur wenn dein Browser WebGPU tatsächlich unterstützt** (echter Adapter-Test, nicht
nur „ist das Objekt vorhanden"). Klickst du auf ein einzelnes, schwer lesbares Zeichen im ersten hochgeladenen
Foto, schneidet SAM (Modell `Xenova/slimsam-77-uniform`, eine für den Browser verkleinerte SAM-Variante) die
zusammenhängende Region an dieser Stelle präzise frei — deutlich genauer als ein starres Kachel-Raster — und der
freigestellte Ausschnitt wird zusätzlich geprüft; neue Zeichen erscheinen zusammen mit den Funden aus Kachelung/
Selbstprüfung/Mehrfach-Abstimmung im Abschnitt „🔬 Zusätzlich gefundene Zeichen". Die Inferenz läuft lokal im
Browser über WebGPU; nur die Modellgewichte werden beim ersten Klick einmalig von Hugging Face nachgeladen — das
Tafelfoto selbst verlässt dafür nicht den Browser.

**Ehrliche Einordnung — das ist weiterhin experimentell und ungetestet gegen echtes WebGPU:** In der Umgebung, in
der dieser Code vor der Auslieferung geprüft wird, ist WebGPU nachweislich nicht funktionsfähig (Chromium meldet
selbst „Failed to create WebGPU Context Provider"), weshalb ich die eigentliche SAM-Erkennung nicht mit echten
Zeichenfotos testen konnte. Getestet wurde stattdessen die komplette Pipeline drumherum (Klickkoordinaten →
Bounding-Box-Berechnung aus der Maske → Zuschnitt → KI-Anfrage → Anzeige) gegen ein simuliertes WebGPU/SAM-Modul
mit exakt der dokumentierten Datenstruktur der echten Bibliothek — das prüft, dass der Code korrekt verdrahtet
ist, aber NICHT, ob das echte Modell in deinem Browser tatsächlich lädt und sinnvolle Ergebnisse liefert. Mögliche
Fehlerquellen, die ich nicht ausschließen kann: die CDN-Einbindung von `@huggingface/transformers` könnte in der
Praxis anders funktionieren als dokumentiert, das Modell könnte je nach Browser/Grafikkarte nicht laden, oder die
Ausschnitt-Erkennung könnte ungenau sein. Schlägt es fehl, siehst du eine klare Fehlermeldung direkt im
SAM-Abschnitt — der Rest des Ergebnisses (Kachelung, Selbstprüfung, Mehrfach-Abstimmung, Hauptübersetzung) bleibt
davon komplett unberührt, da jeder Schritt einzeln abgesichert ist. Unterstützt dein Browser kein WebGPU, bleibt
der Abschnitt einfach unsichtbar, ohne dass etwas kaputt geht.

### API-Key (OpenRouter, kostenlos)

`index.html` ruft die [OpenRouter](https://openrouter.ai) Chat-API **direkt aus dem Browser** auf (keine eigene
Backend-Komponente, passend zum bisherigen „installationsfrei im Browser“-Ansatz des Projekts). OpenRouter wurde
bewusst statt Anthropic gewählt, weil es kostenlose Bild-KI-Modelle anbietet — kein Guthaben/keine Zahlungsdaten
nötig.

**Kostenlosen Key holen:**
1. Auf [openrouter.ai/keys](https://openrouter.ai/keys) registrieren (kostenlos, keine Zahlungsdaten nötig).
2. Einen API-Key erzeugen (beginnt mit `sk-or-...`).
3. In `index.html` oben rechts auf „⚙ API-Key“ klicken, Key eintragen und speichern (lokal im Browser via
   `localStorage`).

**Wichtig — automatische Modellwahl statt fest eingetragenem Modell:**

Ein einzelnes fest eingetragenes kostenloses Modell ist mit der Zeit unzuverlässig geworden, weil OpenRouter
sein kostenloses Bild-Modell-Angebot laufend ändert (Modelle verschwinden, neue kommen hinzu). Deshalb wählt
die App das Modell jetzt **automatisch zur Laufzeit**:

1. Beim Absenden fragt die Seite den aktuellen OpenRouter-Modellkatalog ab (`GET /api/v1/models`, kein
   eigener Key nötig) und filtert dort selbst nach Modellen, die **kostenlos** sind und **Bilder verstehen**.
2. Das zuletzt erfolgreich genutzte Modell wird bevorzugt probiert (lokal in `localStorage` gemerkt), danach
   die frisch ermittelten kostenlosen Bild-Modelle, danach eine kleine statische Rückfallliste.
3. Schlägt eine Anfrage an ein Modell fehl, weil es gerade nicht verfügbar, überlastet oder ausgeschöpft ist
   (z. B. „No endpoints found …“), probiert die App automatisch das nächste Modell aus der Liste — ganz ohne
   Eingreifen. Nur eindeutig endgültige Fehler (ungültiger/fehlender API-Key, kein Netzwerk) brechen sofort ab.
4. Das Modellfeld im API-Key-Bereich ist standardmäßig leer („automatisch (empfohlen)“) und muss nur ausgefüllt
   werden, wenn ausdrücklich ein bestimmtes Modell erzwungen werden soll.

Damit funktioniert der Button „Tafel übersetzen“ auch dann zuverlässig, wenn das zuvor genutzte kostenlose
Modell von OpenRouter entfernt wurde — ohne dass Nutzer:innen selbst recherchieren müssen, welches Modell
aktuell verfügbar ist.

**Zusätzliche Zuverlässigkeit — zwei Durchläufe statt einem:** Der kostenlose Bild-Modell-Katalog von
OpenRouter ist sehr volatil — auch einzelne, im Katalog gelistete Modelle können kurzzeitig ohne
Serving-Kapazität sein, nicht nur veraltete/entfernte Modelle (so trat z. B. zeitweise bei
`google/gemini-2.0-flash-exp:free` ein „derzeit nicht verfügbar“ auf, obwohl es im Katalog stand). Schlägt
daher ein **kompletter** erster Durchlauf durch alle Kandidatenmodelle fehl, wartet die App kurz (2,5 Sekunden)
und probiert danach automatisch einen **zweiten kompletten Durchlauf** — das federt kurzzeitige
Kapazitätsengpässe ab, bevor der Nutzerin/dem Nutzer ein Fehler angezeigt wird. Die statische Rückfallliste
(`STATIC_FALLBACK_MODELS` in `index.html` bzw. `woerterbuch.html`) wurde außerdem aktualisiert und auf mehrere
Anbieter verteilt (Qwen, Meta/Llama, Google Gemma, Mistral, Z.ai, Moonshot), damit nicht ein einzelner Anbieter
zum Single Point of Failure wird. Schlagen beide Durchläufe fehl, listet die Fehlermeldung alle versuchten
Modelle auf und verweist auf openrouter.ai/models, statt nur eine kryptische Einzel-Fehlermeldung zu zeigen.
Eine hundertprozentige Garantie ist bei einem rein clientseitigen, kostenlosen Modell-Ansatz naturgemäß nicht
möglich — aber die Wahrscheinlichkeit eines sichtbaren Fehlschlags sinkt durch die Kombination aus aktueller
Kandidatenliste, Laufzeit-Entdeckung und Zwei-Durchlauf-Retry deutlich.

**Weiteres:**
- Der Key verlässt den Browser nur in Richtung `openrouter.ai` — es gibt keinen zwischengeschalteten Server.
- `localStorage` ist pro Gerät/Browser sichtbar. Nicht auf fremden oder geteilten Rechnern verwenden.
- **„Verbindung testen“**-Button im API-Key-Bereich: prüft mit einer minimalen Anfrage sofort, ob der Key
  funktioniert — inklusive automatischer Modellwahl, ohne dafür erst ein Foto hochladen zu müssen. Während
  des Prüfens wird das gerade probierte Modell angezeigt.
- Kostenlose Modelle sind pro Minute rate-limitiert (typisch niedrige zweistellige Anfragen/Minute); auch das
  löst automatisch einen Wechsel zum nächsten Modell aus.
- Bei einem endgültigen Fehler (z. B. ungültiger Key) zeigt die Seite eine verständliche deutsche Meldung statt
  des rohen API-Fehlers.

### Oberfläche (vereinfacht, Expeditions-/Archäologie-Design)

Die Oberfläche wurde bewusst radikal vereinfacht, nachdem sich der ursprüngliche mehrstufige Ablauf (Vorschau,
Regionsmarkierung, einzelne Bestätigungsschritte) in der Praxis als zu kompliziert erwiesen hat. `index.html`
ist einspaltig, ohne Schritt-Navigation: Foto hochladen, ein Knopf, ein Ergebnis. Der Foto-Upload steht direkt
unter der Überschrift im Fokus der Seite — kein Zeichenarchiv und keine anderen Inhalte lenken davon ab (das
Archiv ist eine eigene Seite, `archiv.html`, über einen Link erreichbar). Der API-Key sitzt in einem
einklappbaren Bereich (Status als Chip oben rechts sichtbar: „Kein API-Key“ / „API-Key gesetzt“) statt
permanent im Weg zu sein, und Fehler erscheinen als schließbares Banner statt als roter Text.

Buttons, Eingabefelder, der Zurück-Link und die Zeichen-Chips sind bewusst groß und mit deutlichen
Touch-Zielen gestaltet (mindestens ~42–46 px Höhe, der Haupt-Button „Tafel übersetzen“ knapp 70 px) — wie bei
einer App statt einer klassischen Website, damit die Bedienung auch auf dem Smartphone beim Fotografieren vor
Ort komfortabel ist.

Beide Seiten haben zusätzlich ein Design im Stil einer Expeditions-/Grabungsakte bekommen — verspielt, aber
bewusst weiterhin klar und funktional gehalten:

- **Farben & Materialien:** warme Pergament-/Sandtöne, ein dunkles Leder-Header (wie ein Feldtagebuch-Einband),
  Messing/Bronze-Akzente für Buttons und Rahmen, siegelrote Hervorhebung für die wahrscheinlichste Sprache.
- **Typografie:** „Cinzel“ (gemeißelt wirkende Groteske) für Überschriften und Aktionen, „Vollkorn“ (warme
  Buchschrift) für Fließtext — beide als Google Font nachgeladen, mit Systemschrift-Fallback bei fehlendem
  Internetzugriff.
- **Motive:** ein Kompass im Logo, Zeichen-Chips im Stil von Museums-Exponatschildern, Sprachtreffer als
  „gestempelte“ Karten, angeschnittene Pergament-Ecken an Karten und der Detailansicht, ein sich drehender
  Kompass (🧭) statt eines generischen Lade-Spinners.
- Das „Details anzeigen“ wurde thematisch zu **„Grabungsprotokoll“** — Funktion und Inhalt sind unverändert.

Beide Seiten laden zusätzlich die Google-Font „Noto Sans Cuneiform“ nach, damit die Zeichen-Glyphen auch auf
Systemen ohne installierten Keilschrift-Font korrekt angezeigt werden (mit Offline-Fallback auf die
Systemschrift; dafür ist wie für die übrigen Google Fonts einmalig eine Internetverbindung beim Laden der
Seite nötig).

### Bekannte Grenzen (bewusste Entscheidungen für diese Version)

- Kein manuelles Markieren von Zeichenregionen mehr, keine manuelle Bildvorverarbeitung (Helligkeit/Kontrast/
  Freistellung) — die KI erhält die Fotos komplett und liefert direkt ein Gesamtergebnis. Wer sehr gezielt
  einzelne, schwer lesbare Stellen prüfen möchte, kann davon zusätzliche Detailfotos hochladen.
- Der OSL-Namensabgleich der Zeichen-Chips ist exakt (nach Normalisierung von `|...|`), keine Fuzzy-Suche —
  Zeichen mit komplexen Namensvarianten (`A×GAN₂@t`) werden von der KI seltener exakt getroffen als einfache
  Namen (`AN`, `LUGAL`, `KI`); das Zeichen erscheint dann als „kein Treffer“, die Lesung selbst bleibt aber im
  Ergebnis sichtbar.
- Eine Anfrage deckt alle hochgeladenen Fotos gemeinsam ab; es gibt keine Möglichkeit, einzelne Zeichen isoliert
  neu anfragen zu lassen — dafür „Neu analysieren“ für einen kompletten neuen Versuch.
- Die Vollständigkeits-Anweisung im Prompt erhöht die Wahrscheinlichkeit einer vollständigen Erfassung deutlich,
  ist aber keine Garantie — bei sehr langen oder sehr dicht beschriebenen Tafeln kann ein Modell trotzdem kürzen;
  in dem Fall hilft „Neu analysieren“ oder ein anderes (manuell eingetragenes) Modell.
- Die Sprachen-/Epochenzuordnung im Zeichenarchiv basiert auf paläographischen Katalogen pro Textkorpus, nicht
  auf einer geprüften Sprachzuordnung pro Einzelzeichen; das kuratierte Bedeutungsglossar deckt rund 140 der
  3.444 Einträge ab. Beides ist in der Oberfläche klar als Annäherung bzw. unvollständig gekennzeichnet.
- Die Zwei-Durchlauf-Retry-Logik erhöht die Zuverlässigkeit deutlich, ist aber keine hundertprozentige Garantie
  gegen einen sichtbaren Fehler — bei einem sehr breiten, gleichzeitigen Ausfall des kostenlosen OpenRouter-
  Angebots (z. B. anbieterweite Wartung) hilft nur ein erneuter Versuch nach einigen Minuten oder ein manuell
  eingetragenes Modell.
- Die automatische Sprachbestimmung bleibt der unsicherste Teil der Analyse — die Prompt-Überarbeitung gegen
  Sumerisch/Akkadisch-Bias (siehe oben) senkt das Fehlerrisiko deutlich, kann eine Fehlbestimmung aber nicht
  ausschließen, insbesondere bei schlechter Bildqualität oder ungewöhnlichen Schriftvarianten. Die neue
  Begründungsanzeige (`language_reasoning`) macht das für Nutzer:innen überprüfbar, statt es zu verschleiern.
- Diese App nutzt bewusst ein allgemeines multimodales KI-Modell statt eines spezialisierten, auf echten
  Keilschriftfotos trainierten Zeichenerkennungs-Modells (wie es z. B. die electronic Babylonian Library
  einsetzt) — das ist der bewusste Preis einer rein clientseitigen, konto- und installationsfreien Architektur
  ohne eigenes Backend. Eine Genauigkeit auf Fachmodell-Niveau ist damit realistisch nicht erreichbar.
- Die Nahaufnahme-Kachelung verbraucht zusätzliche Anfragen (bis zu 6 pro Analyse) bei denselben ratenlimitierten
  kostenlosen Modellen wie die Haupterkennung — bei sehr häufiger Nutzung in kurzer Zeit steigt dadurch das
  Risiko eines Rate-Limits. Sie hilft außerdem nur gegen zu geringe effektive Auflösung im Gesamtbild, nicht
  gegen das grundsätzlichere Problem einer flach/frontal beleuchteten Aufnahme ohne Schattenwurf in den
  Keilkerben (dafür ist die Aufnahmetechnik selbst entscheidend, siehe Recherche oben).
- Die KI-Vorschläge im Begriffs-Wörterbuch für Sprachen außerhalb des Kurzglossars (Hethitisch, Elamisch, …)
  sind reine Sprachmodell-Hypothesen ohne Anbindung an eine geprüfte lexikalische Quelle — entsprechend deutlich
  als „unverifiziert” markiert. Insbesondere bei modernen oder kulturspezifischen Begriffen ohne antikes
  Äquivalent sind falsche oder erfundene Vorschläge möglich; die KI wird angewiesen, in solchen Fällen ehrlich
  „kein Äquivalent bekannt” zu antworten, aber auch das ist keine Garantie.
- Selbstprüfung und Mehrfach-Abstimmung (siehe oben) markieren Abweichungen nur als Hinweis, nicht als
  Fehlerbeweis — ein „⚠ abweichend”-Badge kann auch entstehen, wenn das zweite, unabhängige Modell schwächer
  oder unvollständiger war, nicht weil die Haupterkennung falsch lag. Beide Prüfungen verdoppeln bzw.
  verdreifachen die Anzahl der Anfragen pro Analyse und erhöhen damit das Rate-Limit-Risiko bei kostenlosen
  Modellen zusätzlich zur Nahaufnahme-Kachelung.
- Die SAM-Klick-Segmentierung („🎯 Zeichen präzise ausschneiden”) nutzt mangels browserfähigem SAM2 nur das
  ältere SAM (Version 1) und segmentiert deshalb ausschließlich EINEN angeklickten Bereich, nicht automatisch
  alle Zeichen der Tafel; sie ist außerdem nur sichtbar, wenn der Browser WebGPU tatsächlich unterstützt, und
  wurde mangels funktionsfähigem WebGPU in der Testumgebung nur in ihrer Verdrahtung (simuliertes Modell),
  nicht mit echter SAM-Inferenz getestet (Details siehe Abschnitt „Zeichensegmentierung im Browser (SAM)” oben).
  Lädt beim ersten Klick zusätzlich ein Modell von Hugging Face nach (weiterer externer Dienst neben OpenRouter,
  überträgt aber keine Bilddaten — nur Modellgewichte werden heruntergeladen).

### Fortschritt & Gamification (`gamify.js`)

Auf Wunsch wurde die Oberfläche um eine spielerische, app-ähnliche Fortschrittsebene ergänzt, die seitenübergreifend
(`index.html`, `archiv.html`, `woerterbuch.html`) funktioniert:

- **XP & Ränge:** Für abgeschlossene Tafel-Übersetzungen (+10 XP), neu kennengelernte Einzelzeichen (+1 XP je
  Zeichen, egal ob beim Übersetzen, im Zeichenarchiv oder im Wörterbuch entdeckt) und Wörterbuch-Suchen (+3 XP)
  gibt es Erfahrungspunkte. Sieben Ränge von „🌱 Neuling“ bis „🧭 Hüter(in) der Tafeln“ schalten sich mit
  steigender XP-Zahl frei; ein Rangaufstieg zeigt eine kurze Benachrichtigung („Toast“) und lässt den
  Fortschritts-Chip oben rechts kurz aufleuchten.
- **Errungenschaften:** acht Meilensteine (erste Übersetzung, zehn Übersetzungen, erste erkannte KI-Ergänzung,
  25/100 kennengelernte Zeichen, zehn im Archiv angesehene Zeichen, erste/zehnte Wörterbuch-Suche) schalten sich
  automatisch frei und werden per Toast gemeldet.
- **Fortschritts-Chip & -Panel:** Der Chip oben rechts in der Kopfzeile zeigt Rang und XP-Stand; ein Klick öffnet
  ein Panel mit Rang, XP-Fortschrittsbalken zum nächsten Rang und der vollständigen Errungenschaften-Liste
  (freigeschaltete vs. noch gesperrte Einträge).
- **Rein lokal, rein kosmetisch:** Der gesamte Fortschritt liegt ausschließlich in `localStorage` dieses
  Browsers (kein Server, kein Konto, keine Übertragung) und beeinflusst keine inhaltliche Funktion der App —
  er dient nur der Motivation und macht den eigenen Lernfortschritt sichtbar. Beim Löschen der Browserdaten
  geht er verloren; das ist bewusst in Kauf genommen, um keine zusätzliche Server-Komponente einzuführen.
- **Zeichen-Chips mit gestaffelter Enthüllungs-Animation:** Nach einer Übersetzung erscheinen die Zeichen-Chips
  nacheinander mit kurzer Verzögerung statt alle gleichzeitig — für ein spürbareres „Entdeckungs“-Gefühl beim
  Sichten des Ergebnisses.

`gamify.js` ist bewusst als eigene, kleine Datei ausgelagert (statt in jeder Seite dupliziert), damit alle drei
Seiten exakt dasselbe Fortschrittsmodell teilen und ein im Archiv gesehenes Zeichen genauso zählt wie eines aus
einer Tafel-Übersetzung.

### MVP 0.6 — Begriffs-Wörterbuch (`woerterbuch.html`, neu)

Ergänzt die App um eine dritte Seite: einen deutschen Begriff eingeben und passende Keilschriftzeichen bzw.
Übersetzungen finden — die Umkehrrichtung zur Tafel-Übersetzung (dort: Zeichen → Bedeutung; hier: Bedeutung →
Zeichen).

- **Kurzglossar-Treffer (primär, kuratiert):** Die Suche durchsucht zuerst das bestehende, recherchierte
  `data/logogram_glossary.json` (deutsche Bedeutung, sumerische Lesung, akkadische Lesung als Sumerogramm,
  Kategorie) — dieselbe Datenquelle, die bereits im Zeichenarchiv verwendet wird. Treffer werden als Karten mit
  echter OSL-Glyphe (falls zuordenbar), Zeichenname, Lesung und Bedeutung angezeigt; ein Klick öffnet eine
  Detailansicht. Diese Treffer sind **keine** KI-Ausgabe, sondern stammen aus derselben kuratierten Quelle wie im
  Archiv — entsprechend ohne Unsicherheits-Kennzeichnung.
- **KI-Vorschläge für weitere Keilschriftsprachen (optional, klar als unverifiziert markiert):** Das
  Kurzglossar deckt nur Sumerisch/Akkadisch ab. Für die übrigen in `data/languages.json` erfassten
  Keilschriftsprachen (Hethitisch, Elamisch, Altpersisch, Ugaritisch, Eblaitisch, Hurritisch, Urartäisch) gibt
  es einen Button „🔮 KI-Vorschlag anfragen“, der optional (nicht automatisch) eine KI-Anfrage auslöst — mit
  derselben Modell-Fallback-/Zwei-Durchlauf-Logik wie in `index.html` (eigene Kopie in `woerterbuch.html`,
  gleicher API-Key aus `localStorage`). Das Ergebnis listet für jede Sprache ein vorgeschlagenes Wort, ggf.
  zugehörige Zeichennamen (mit Glyphe, sofern in der lokalen OSL-Datenbank auffindbar) und eine Confidence-Angabe
  — oder ehrlich „kein Äquivalent bekannt“, wenn die KI selbst unsicher ist oder der Begriff kulturell nicht
  übertragbar erscheint (z. B. moderne Konzepte, Eigennamen). Jedes KI-Ergebnis trägt sichtbar den Hinweis
  „KI-Vorschlag, unverifiziert“ und einen erläuternden Disclaimer-Kasten — konsequent nach demselben
  Ehrlichkeitsprinzip wie die erkannt/ergänzt-Markierung bei der Tafel-Übersetzung (Konzeptdokument Abschnitt 32).
  KI-vorgeschlagene Zeichen zählen bewusst **nicht** zum „kennengelernte Zeichen“-Fortschritt (siehe oben) — nur
  verifizierte Treffer (Kurzglossar, Zeichenarchiv, tatsächlich fotografierte Tafeln) tun das.
- Der API-Key ist für das Wörterbuch **optional** — die Kurzglossar-Suche funktioniert ohne Key; nur die
  KI-Vorschläge für weitere Sprachen benötigen ihn (gemeinsamer `localStorage`-Key mit `index.html`, kein
  erneutes Eintragen nötig, wenn er dort schon gesetzt wurde).

### MVP 0.6 — kontextuelle linguistische Analyse (begonnen)

Laut Konzeptdokument (Abschnitt 28/32) ist MVP 0.6 die kontextuelle linguistische Analyse und Übersetzung. Ein
erster Teil davon ist bereits umgesetzt:

- **Kontextuelle Lesung** (Abschnitt 15): Zeichen werden nicht mehr nur mit ihrem Namen ausgegeben, sondern die
  KI liefert zusätzlich die im Satzzusammenhang wahrscheinlichste Lesung — sichtbar in der Zeichen-Detailansicht
  als „Erkannt“ vs. „Interpretierte Lesung im Kontext“.
- **Wortanalyse** (Abschnitt 16, Ebene 2 „Wortanalyse“ zwischen Transliteration und Übersetzung): eine
  vollständige Wort-für-Wort-Liste der Begriffe der Transliteration mit kurzer deutscher Bedeutung.
- **Vollständige Erfassung + erkannt/ergänzt-Markierung** (Abschnitt 32): siehe Abschnitt „Vollständigkeit &
  Markierung ergänzter Textstellen“ oben — jedes Zeichen der Tafel wird erfasst, ergänzter Text bleibt klar
  von direkt gelesenem Text unterschieden.

Noch offen für MVP 0.6/0.7:

- Grammatik-/Morphologie-Analyse (Abschnitt 17) als eigene Ebene.
- Echte DCCLT/ePSD2-Anbindung, damit Übersetzungsvorschläge nicht nur vom KI-Sprachwissen, sondern auch von
  echten lexikalischen Daten gestützt werden (Abschnitt 15–17) — dafür gibt es aktuell noch keinen Importer.
- MVP 0.7: Abgleich mit CDLI/bekannten Tafeln (Abschnitt 18/29).

---

## MVP 0.4.1 — Zeichenbrowser

### Was ist neu in 0.4.1?

Diese Version schließt die in MVP 0.4 offen gebliebenen Punkte der Roadmap ab
(Konzeptdokument, Abschnitt 26 „MVP 0.4“) und behebt einen Fehler im Importer.

### Bugfix: veraltete Einträge wurden falsch zugeordnet

Der OSL-Importer erkannte Zeilen wie `@sign- |A.GAN₂@t|` und `@form- AŠ@f`
(veraltete/verworfene Zeichen und Formen) bislang **nicht** als eigenständigen
Datensatz-Anfang. Dadurch liefen sie in den vorherigen Datensatz hinein, und
dessen `@oid` wurde von der OID des eigentlich veralteten Zeichens
überschrieben — der vorherige, gültige Datensatz verlor seine korrekte ID und
wurde fälschlich als "deprecated" markiert.

Betroffen waren 62 `@sign-` und 31 `@form-` Einträge in der vollständigen OSL.
Der Importer ordnet diese jetzt korrekt als eigene Datensätze zu.
Ein Regressionstest (`tests/test_import.py`) sichert das ab.

### Vollständiger Import (Roadmap-Punkt 1)

`data/signs.osl.json` enthält jetzt den vollständigen Import statt der
32/3-Zeichen-Seed-Basis:

- **3.303 Zeichen** (davon 62 als veraltet markiert)
- **141 Nur-Komposita** (`@compoundonly`: attestierte Komposit-Namen ohne
  eigenen Zeichen-Datensatz/OID in der OSL — neu, optional über
  `--include-compound-only`)
- Formen (`@form`, 1.216 aktuell + 31 veraltet) werden weiterhin nur mit
  `--include-forms` importiert, siehe unten.

### Erweiterte Datenstruktur (Roadmap-Punkt 2)

Zusätzlich zu den bisherigen Feldern werden jetzt erfasst:

- `readings_historical` (`@v-`) — historische/verworfene Lesungen, getrennt
  von aktuell gültigen Werten
- `unicode_pua` (`@upua`) — Private-Use-Area-Codepoint für Zeichen ohne
  offiziellen Unicode-Block
- `provisional_names` (`@pname`) — alternative/provisorische Namen
- `placeholder_glyph_flag` (`@fake`) — markiert technische Platzhalter-Glyphen
- `extra_fields` — **alle** übrigen erkannten OSL-Tags werden roh mitgeführt,
  damit beim Import nichts stillschweigend verloren geht (Quellenprinzip,
  Konzeptdokument Abschnitt 7)

Details siehe `data/schema.json`.

### Zeichenbrowser + Detailansicht (Roadmap-Punkte 3 + 4)

`archiv.html` ist jetzt interaktiv klickbar (Konzeptdokument Abschnitt 14,
„Interaktive Zeichenanalyse“):

- Suche über Name, Werte, Unicode-Name, Zeichenlisten
- Filter nach Typ (Zeichen / Formen / Nur-Komposita) und nach
  „veraltete Einträge ausblenden“
- Statistikzeile mit Gesamtzahlen
- Klick auf ein Zeichen öffnet eine Detailansicht mit: Unicode-Angaben,
  aktuellen und historischen Lesungen, Zeichenlisten-Referenzen, AKA/
  provisorischen Namen, externen Links (klickbar), Anmerkungen, Literatur
  und einer Quellenangabe mit Lizenz aus `data/sources.json`
- Deutliche Warnhinweise bei veralteten Einträgen, Nur-Komposita-Einträgen
  und Platzhalter-Glyphen — die Anwendung soll Unsicherheit sichtbar machen,
  nicht verstecken (Konzeptdokument Abschnitt 10 & 32)

### DCCLT / ePSD2 (Roadmap-Punkt 5)

Noch **nicht** importiert. `data/sources.json` enthält die Quellenangaben
bereits vorbereitet (inkl. Lizenzhinweis „projektabhängig zu prüfen“), damit
Zeichen künftig direkt mit lexikalischen Einträgen verknüpft werden können.
Das ist bewusst der nächste Schritt nach 0.4.1 und noch nicht Teil dieser
Version — es gibt hierfür noch keinen Importer.

## MVP 0.4.2 — Sprachen-/Epochenfilter & Kurzglossar im Zeichenarchiv

Die OSL selbst katalogisiert **Zeichenformen**, nicht Sprachen oder Bedeutungen — pro Zeichen gibt es weder ein
Sprach-Tag noch eine Übersetzung. Damit sich das Zeichenarchiv trotzdem sinnvoll nach Sprache/Epoche
durchsuchen lässt und Bedeutungen zeigt, wo möglich, kamen zwei recherchierte, klar von der OSL getrennte
Zusatzdatensätze hinzu:

- **`data/languages.json`** — 17 Sprachen/Epochen, die Keilschrift verwendet haben (Sumerisch in drei
  Zeitstufen, Akkadisch allgemein sowie sieben Dialekt-/Periodenstufen von Altbabylonisch bis Neuassyrisch,
  Eblaitisch, Hethitisch, Hurritisch, Elamisch, Urartäisch, Altpersisch, Ugaritisch) mit Zeitraum, Schrifttyp
  und einer kurzen Beschreibung. Für Altbabylonisch ist z. B. explizit vermerkt: grundsätzlich eine Silbenschrift,
  daneben aber ein festes Set an Sumerogrammen (Wortzeichen) für häufige Begriffe wie Titel, Götter oder Zahlen.
  Jede Sprache ist mit den dafür einschlägigen OSL-Zeichenlisten-Katalogen verknüpft (`sign_list_codes`), soweit
  vorhanden — bei Sprachen mit eigenem, nicht-mesopotamischem Zeichensystem (Elamisch, Urartäisch, Altpersisch,
  Ugaritisch, Hurritisch) ist das ehrlich leer, und die Auswahl zeigt dann eine erklärende Übersicht statt
  irreführend gefilterter Zeichen.
- **`data/sign_lists_info.json`** — Kurzbeschreibungen (mit Quelle/Autor, Zeitraum, Textkorpus) der 15 in den
  OSL-Datensätzen referenzierten paläographischen Zeichenlisten-Kataloge (LAK, MZL, ABZL, ASY, HZL, ZATU, …) —
  als Tooltip bei den „Zeichenlisten-Referenzen“ in der Detailansicht.
- **`data/logogram_glossary.json`** — ein kuratiertes Kurzglossar von 142 häufigen sumerischen Wortzeichen
  (Logogrammen) mit deutscher Bedeutung, Kategorie und — soweit gebräuchlich — der akkadischen Lesung als
  Sumerogramm (z. B. LUGAL → „König“ → akkadisch *šarrum*). Wird automatisch mit passenden OSL-Zeichen verknüpft
  (Abgleich über Name/Lesungen, unabhängig von Groß-/Kleinschreibung und tief-/hochgestellten Ziffern) und dort
  als eigener, klar gekennzeichneter Abschnitt „Kuratierte Bedeutung (Kurzglossar)“ angezeigt — bewusst getrennt
  von der primären OSL-Angabe, unvollständig (ca. 140 von 3.444 Einträgen) und nicht Teil der offiziellen OSL.
  Bedeutungen sind zusätzlich über die Suche auffindbar (z. B. „König“ findet LUGAL).

Alle drei Datensätze wurden recherchiert und mit Quellenangaben versehen (u. a. Oracc/OSL-Repository, Unicode-
Referenzdokument zu Zeichenlisten, ePSD2, Sumerian Lexicon, Wikipedia-Fachartikel zu Sumerogramm/Akkadisch/
Elamisch) — Details direkt in den `_meta`-Feldern der jeweiligen JSON-Dateien. Die Sprachauswahl in `archiv.html`
filtert die Zeichenliste anhand der zugeordneten Kataloge und zeigt dazu eine Infobox mit Zeitraum, Schrifttyp
und einem expliziten Hinweis, wie genau diese Zuordnung ist (Katalog-basiert = Annäherung nach Textkorpus,
keine geprüfte Sprachzuordnung pro Einzelzeichen).

## Import ausführen

```bash
python scripts/import_osl.py
```

Lädt standardmäßig:

```text
https://raw.githubusercontent.com/oracc/osl/master/00lib/osl.asl
```

und erzeugt `data/signs.osl.json`.

### Offline-Modus

```bash
python scripts/import_osl.py --input osl.asl
```

### Formen und Nur-Komposita einschließen

```bash
python scripts/import_osl.py --include-forms --include-compound-only
```

Das mitgelieferte `data/signs.osl.json` wurde mit `--include-compound-only`
(ohne `--include-forms`) erzeugt.

### Tests

```bash
python tests/test_import.py
```

Prüft u. a. den oben beschriebenen Bugfix anhand von `tests/osl.sample.asl`.

## Browser

`archiv.html` lädt zuerst `data/signs.osl.json`. Fehlt die Datei (z. B. vor
dem ersten Import), verwendet die Oberfläche automatisch
`data/signs.seed.json` als kleine Demo-Basis mit drei echten Beispielzeichen
im gleichen Datenschema.

Zum lokalen Ausprobieren, da der Browser `fetch()` für die JSON-Dateien
braucht (kein direktes Öffnen der `.html`-Dateien per Doppelklick):

```bash
python -m http.server 8000
```

und dann `http://localhost:8000/` öffnen — das lädt direkt die
Tafel-Übersetzung (`index.html`); Zeichenarchiv und Begriffs-Wörterbuch sind
über die Links oben rechts erreichbar.

## Lizenz

Die OSL-Datei enthält selbst den Hinweis:

`CC0: osl.asl and its associated files are placed in the public domain under a CC0 licence.`

Für DCCLT, ePSD2, ORACC-Projekte und CDLI müssen die jeweiligen
Lizenzbedingungen separat geprüft werden, bevor sie eingebunden werden.

Die Bilderkennung selbst (Foto-Upload, automatische KI-Analyse mit Sprach-, Zeichen- und Übersetzungserkennung,
editierbare Ergänzungen bei beschädigten Stellen) ist in `index.html` umgesetzt — siehe Abschnitt
„MVP 0.5 — Tafel-Übersetzung mit KI-Unterstützung“ oben.
