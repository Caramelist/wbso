import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          {/* Header */}
          <div className="border-b border-slate-200 pb-6 mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Privacybeleid WBSO Simpel</h1>
            <p className="text-slate-600 mt-2">
              <strong>Laatst bijgewerkt:</strong> [Datum]<br />
              <strong>Van kracht vanaf:</strong> [Datum]
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">1. Wie zijn wij?</h2>
            <p className="text-slate-700 mb-4">
              <strong>WBSO Simpel</strong> is een dienst van [Uw Bedrijfsnaam]<br />
              <strong>KvK-nummer:</strong> [Uw KvK nummer]<br />
              <strong>Adres:</strong> [Uw bedrijfsadres]<br />
              <strong>E-mail:</strong> privacy@wbsosimpel.nl<br />
              <strong>Telefoon:</strong> [Uw telefoonnummer]
            </p>
            <p className="text-slate-700 mb-6">
              Wij zijn de verwerkingsverantwoordelijke voor de verwerking van uw persoonsgegevens zoals beschreven in dit privacybeleid.
            </p>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">2. Welke gegevens verzamelen wij?</h2>
            
            <h3 className="text-xl font-medium text-slate-800 mt-6 mb-3">2.1 Accountgegevens</h3>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
              <li><strong>Naam en contactgegevens:</strong> Voor- en achternaam, e-mailadres, telefoonnummer</li>
              <li><strong>Bedrijfsgegevens:</strong> Bedrijfsnaam, KvK-nummer, adres, functietitel</li>
              <li><strong>Inloggegevens:</strong> E-mailadres en beveiligde wachtwoordinformatie</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-800 mt-6 mb-3">2.2 WBSO Aanvraaggegevens</h3>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
              <li><strong>R&D Projectinformatie:</strong> Projectbeschrijvingen, technische details, onderzoeksactiviteiten</li>
              <li><strong>Financiële gegevens:</strong> Uren, kosten, personeelsinformatie gerelateerd aan R&D</li>
              <li><strong>Bedrijfsinformatie:</strong> Organisatiestructuur, technische expertise, innovatieactiviteiten</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-800 mt-6 mb-3">2.3 AI Conversatiegegevens</h3>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
              <li><strong>Chatgesprekken:</strong> Berichten uitgewisseld met onze AI-assistent</li>
              <li><strong>Gegenereerde content:</strong> Door AI opgestelde concepten en documenten</li>
              <li><strong>Gebruiksstatistieken:</strong> Tijdstempel, sessieduur, functionaliteitsgebruik</li>
            </ul>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">3. Waarom verwerken wij uw gegevens?</h2>

            <h3 className="text-xl font-medium text-slate-800 mt-6 mb-3">3.1 Dienstverlening (Artikel 6 lid 1 sub b AVG)</h3>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
              <li><strong>WBSO aanvragen opstellen:</strong> Genereren van complete aanvraagdocumenten</li>
              <li><strong>AI-assistentie:</strong> Gepersonaliseerde hulp bij het invullen van R&D gegevens</li>
              <li><strong>Documentbeheer:</strong> Opslaan en beschikbaar stellen van uw aanvragen</li>
              <li><strong>Klantenservice:</strong> Ondersteuning bij vragen over de dienst</li>
            </ul>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">4. AI Gegevensverwerking (Anthropic Claude)</h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">Belangrijke GDPR-informatie:</h4>
              <p className="text-blue-700 text-sm">
                <strong>Verwerker:</strong> Anthropic Ireland Limited<br />
                <strong>Adres:</strong> 6th Floor, South Bank House, Barrow Street, Dublin 4, D04 TR29, Ierland<br />
                <strong>E-mail:</strong> privacy@anthropic.com
              </p>
            </div>

            <h3 className="text-xl font-medium text-slate-800 mt-6 mb-3">4.2 Waarborgen</h3>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
              <li><strong>EU-verwerker:</strong> Anthropic Ireland valt onder Europese jurisdictie</li>
              <li><strong>Geen training:</strong> Uw gesprekken worden NIET gebruikt voor AI-modeltraining</li>
              <li><strong>Beveiliging:</strong> End-to-end versleuteling van alle communicatie</li>
              <li><strong>Standaard contractbepalingen:</strong> Voor eventuele doorgifte naar de VS</li>
            </ul>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">7. Uw rechten onder de AVG</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">Recht op inzage (Art. 15)</h4>
                <p className="text-sm text-slate-600">U heeft het recht om te weten welke persoonsgegevens wij van u verwerken.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">Recht op rectificatie (Art. 16)</h4>
                <p className="text-sm text-slate-600">U kunt verzoeken om correctie van onjuiste of onvolledige gegevens.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">Recht op verwijdering (Art. 17)</h4>
                <p className="text-sm text-slate-600">U kunt verzoeken om verwijdering van uw gegevens, behoudens bewaarplichten.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">Recht op overdraagbaarheid (Art. 20)</h4>
                <p className="text-sm text-slate-600">U kunt uw gegevens in een machineleesbaar formaat opvragen.</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-800 mb-2">Uitoefening van uw rechten:</h4>
              <p className="text-green-700">
                <strong>E-mail:</strong> privacy@wbsosimpel.nl<br />
                <strong>Reactietermijn:</strong> Binnen 1 maand<br />
                <strong>Kosten:</strong> Gratis (tenzij verzoeken kennelijk ongegrond zijn)
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">11. Contact en klachten</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">Privacy Contact</h4>
                <p className="text-slate-700">
                  <strong>E-mail:</strong> privacy@wbsosimpel.nl<br />
                  <strong>Telefoon:</strong> [Uw telefoonnummer]<br />
                  <strong>Adres:</strong> [Uw bedrijfsadres]
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">Klachten</h4>
                <p className="text-slate-700">
                  <strong>Autoriteit Persoonsgegevens</strong><br />
                  Postbus 93374<br />
                  2509 AJ Den Haag<br />
                  Telefoon: 088 – 1805 250
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 pt-6 mt-8">
            <p className="text-sm text-slate-600">
              <strong>Vragen over dit privacybeleid?</strong><br />
              Neem contact met ons op via <a href="mailto:privacy@wbsosimpel.nl" className="text-blue-600 hover:underline">privacy@wbsosimpel.nl</a>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Document versie: 1.0 • Volgende review: [Datum + 6 maanden]
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 