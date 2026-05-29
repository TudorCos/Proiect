# Raport de Activitate - Proiect Magazin Componente PC

Acest document detaliază contribuțiile tehnice și sarcinile individuale realizate de fiecare membru al echipei pe parcursul dezvoltării platformei.

### 1. Frontend Developer

- **Structura de bază:** Am creat scheletul aplicației, inclusiv meniul de sus (cu bara de search și coșul) și footer-ul.
- **Design-ul paginii principale:** M-am ocupat de homepage, mai exact de zona de sus (Hero), categoriile de produse și secțiunea de recomandări.
- **Media și Branding:** Am integrat un video de prezentare YouTube pe prima pagină (forțat să ruleze clar, la 1080p) și am înlocuit vechile texte temporare cu logo-ul oficial al magazinului în tot site-ul.
- **Pagina magazinului:** Am construit catalogul de produse, adăugând o bară în stânga pentru a putea filtra componentele (după brand, categorie, preț) și opțiuni de sortare.
- **Cardurile de produs:** Am făcut design-ul pentru cardurile pe care apar componentele, dar și pagina detaliată unde poți citi specificațiile complete ale unei piese.
- **Coșul de cumpărături:** Am realizat interfața coșului: tabelul cu produsele adăugate, butoanele de plus/minus și partea de jos unde se calculează automat totalul.
- **Componentele de UI:** Am folosit librăria Shadcn UI ca să avem un design modern și uniform la butoane, formulare și input-uri, fără să fim nevoiți să le stilizăm de la zero.
- **Rafinarea temei (Dark Mode):** Am îmbunătățit tema întunecată a site-ului. Am scos fundalurile opace de pe carduri și containere ca să se integreze frumos cu background-ul nostru animat, păstrând o interfață curată, minimalistă și rapidă.
- **Ecran de Încărcare & Popup Feedback Coș:** Am implementat un ecran de încărcare animat (afișat complet, inclusiv peste antet/header) cu logo-ul site-ului pulsând la navigarea între pagini. De asemenea, am dezvoltat actualizarea instantanee, în timp real, a indicatorilor din coș la adăugarea produselor (fără reîncărcarea paginii, prin optimizarea selectorilor Zustand) și afișarea unui toast popup elegant timp de 4 secunde în colțul din dreapta-sus.

### 2. Backend Developer

- **Modelele de date:** Am gândit și scris în cod clasele pentru utilizatori, comenzi, coș și toate cele 10 categorii de componente hardware.
- **Trecerea la Baza de Date Reală:** Am migrat proiectul de la date „la mișto” la o bază de date SQL adevărată. Am configurat backend-ul folosind C# și Entity Framework Core (metoda Code-First) și am legat baza de date prin `appsettings.json`.
- **Sistemul de compatibilitate (Baza):** Am scris logica matematică din spate care îți spune dacă un procesor se potrivește cu placa de bază sau cu memoria RAM (verificând socket-ul).
- **Sistemul de compatibilitate (Avansat):** Am extins verificările ca să calculeze și dacă sursa are destulă putere pentru tot sistemul sau dacă placa video încape fizic în carcasă.
- **Sistemul de emailuri:** Am dezvoltat funcționalitatea prin care serverul nostru trimite automat un email real de confirmare a comenzii către client. L-am optimizat asincron (background thread execution) cu un timeout de 5 secunde pentru a evita blocarea finalizării comenzilor din cauza problemelor de rețea SMTP.
- **Managementul coșului și autentificare (Inițial):** Am scris logica de bază pentru salvarea coșului și sesiunile de logare, făcând diferența de permisiuni între un user normal și un administrator.

### 3. Full-Stack Developer

- **Arhitectura și rutele:** Am pus pe picioare legătura dintre frontend (React/Vite) și noul backend (C#) și am configurat rutele din aplicație (ce pagini sunt publice și care necesită cont).
- **Sistemul de Autentificare:** Am legat formularele de Login și Register de server, făcând aplicația să protejeze rutele sensibile (cum ar fi panoul de comenzi).
- **Persistența datelor:** Am făcut în așa fel încât datele (coșul de cumpărături și sesiunea utilizatorului) să se salveze în memoria browser-ului (Local Storage). Astfel, nu îți pierzi produsele din coș dacă dai refresh sau închizi pagina. De asemenea, am asigurat salvarea permanentă a build-urilor din configuratorul PC direct în baza de date SQL Server.
- **Configuratorul de PC (Builder-ul):** Am construit pagina interactivă unde îți asamblezi PC-ul piesă cu piesă. Am conectat motorul de compatibilitate de la backend ca să afișeze alertele vizuale pe ecranul utilizatorului și am conectat operațiunile de salvare/încărcare/ștergere la API-ul dedicat de pe server.
- **Panoul Clientului și al Adminului:** Am făcut pagina de profil (unde clientul își vede istoricul de comenzi și PC-urile salvate) și dashboard-ul pentru administratori (cu statistici și stocuri).
- **Gestiunea (Admin):** Am creat partea prin care adminii pot adăuga sau edita componente direct de pe site și pot vedea sau schimba statusul comenzilor plasate.
- **Colaborare Inter-Departamentală:** A asigurat legătura constantă dintre frontend și backend pe durata întregului proiect. A lucrat îndeaproape alături de Frontend Developer la integrarea corectă a interfețelor și alături de Backend Developer la conectarea bazei de date SQL și a sistemelor logice la rutele din aplicație.

### 4. Tester (QA)

- **Testarea navigării și erorilor:** M-am plimbat prin tot site-ul ca să mă asigur că nu avem link-uri moarte, că paginile de „Eroare 404” merg și că nu poți „păcăli” site-ul să intri pe pagini de admin nefiind logat.
- **Testarea coșului:** Am simulat zeci de comenzi ca să văd dacă se calculează bine prețurile finale, dacă scad corect cantitățile și dacă produsele dispar singure când pui cantitatea 0.
- **Validarea funcțiilor noi (Baza de Date & Email):** Am testat fluxul proaspăt conectat la backend-ul C#. Am verificat concret dacă datele introduse la checkout se salvează corect în SQL și dacă emailul de confirmare ajunge cu adevărat în Inbox.
- **Testarea Builder-ului de PC:** Am ales intenționat piese care nu se potrivesc ca să fiu sigur că alertele de incompatibilitate (de genul „Socket greșit”) chiar apar și nu te lasă să comanzi un PC stricat.
- **Testarea filtrelor:** Am combinat tot felul de filtre pe pagina magazinului (și brand, și preț, și categorie) ca să văd dacă se blochează și dacă link-ul de sus (URL-ul) se actualizează corect.
- **Testarea pe telefon (Mobile/Responsive):** Am verificat cum se adaptează site-ul pe ecrane mici, confirmând că meniul de tip hamburger se deschide cum trebuie și că textele nu ies din ecran.
- **Planul de testare:** Am pus pe foaie un plan oficial de testare (cu valori de intrare și rezultatele obținute) pentru a-l include în documentația predată la final.
