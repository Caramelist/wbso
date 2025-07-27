import React from 'react';

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          {/* Header */}
          <div className="border-b border-slate-200 pb-6 mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Algemene Voorwaarden WBSO Simpel</h1>
            <p className="text-slate-600 mt-2">
              <strong>Laatst bijgewerkt:</strong> [Datum]<br />
              <strong>Van kracht vanaf:</strong> [Datum]
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            
            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Artikel 1: Definities</h2>
            <p className="text-slate-700 mb-4">In deze algemene voorwaarden wordt verstaan onder:</p>
            <ul className="list-disc pl-6 text-slate-700 mb-6 space-y-2">
              <li><strong>WBSO Simpel:</strong> De online dienst voor het opstellen van WBSO-aanvragen, aangeboden door [Uw Bedrijfsnaam]</li>
              <li><strong>Aanbieder:</strong> [Uw Bedrijfsnaam], KvK-nummer [Nummer], gevestigd te [Adres]</li>
              <li><strong>Gebruiker:</strong> Iedere natuurlijke of rechtspersoon die gebruik maakt van WBSO Simpel</li>
              <li><strong>Account:</strong> Persoonlijke toegang tot de diensten van WBSO Simpel</li>
              <li><strong>AI-assistent:</strong> De kunstmatige intelligentie van Anthropic Claude gebruikt voor WBSO-assistentie</li>
              <li><strong>WBSO:</strong> Wet Bevordering Speur- en Ontwikkelingswerk</li>
            </ul>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Artikel 3: Dienstverlening</h2>
            
            <h3 className="text-xl font-medium text-slate-800 mt-6 mb-3">3.1 Beschrijving diensten</h3>
            <p className="text-slate-700 mb-3">WBSO Simpel biedt:</p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
              <li><strong>AI-geassisteerd opstellen</strong> van WBSO-aanvragen</li>
              <li><strong>Documentgeneratie</strong> voor R&D-projecten</li>
              <li><strong>Begeleiding</strong> bij het aanvraagproces</li>
              <li><strong>Opslag</strong> van aanvraagdocumenten</li>
              <li><strong>Klantenondersteuning</strong> bij het gebruik van het platform</li>
            </ul>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-amber-800 mb-2">⚠️ Belangrijke AI-voorwaarden:</h4>
              <ul className="text-amber-700 text-sm space-y-1">
                <li>• AI-gegenereerde content dient altijd gecontroleerd te worden door de Gebruiker</li>
                <li>• Aanbieder garandeert niet de juistheid van AI-gegenereerde inhoud</li>
                <li>• Gebruiker blijft eindverantwoordelijk voor alle ingediende aanvragen</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Artikel 5: Verplichtingen Gebruiker</h2>

            <h3 className="text-xl font-medium text-slate-800 mt-6 mb-3">5.1 Toegestaan gebruik</h3>
            <p className="text-slate-700 mb-3">Gebruiker zal:</p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
              <li>Diensten uitsluitend gebruiken voor het opstellen van legitieme WBSO-aanvragen</li>
              <li>Accurate informatie verstrekken over R&D-activiteiten</li>
              <li>Intellectuele eigendomsrechten van derden respecteren</li>
              <li>Geldende wet- en regelgeving naleven</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-800 mt-6 mb-3">5.2 Verboden gebruik</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-medium mb-2">Het is verboden om:</p>
              <ul className="list-disc pl-6 text-red-700 space-y-1">
                <li><strong>Valse informatie</strong> te verstrekken in WBSO-aanvragen</li>
                <li><strong>Inbreuk te maken</strong> op intellectuele eigendomsrechten</li>
                <li><strong>Kwaadaardige software</strong> te uploaden of te verspreiden</li>
                <li><strong>Illegale activiteiten</strong> te faciliteren via het platform</li>
                <li><strong>Reverse engineering</strong> toe te passen op de AI-technologie</li>
                <li><strong>De dienst te gebruiken</strong> voor concurrentieanalyse</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Artikel 6: Intellectuele eigendom</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">Platform eigendom</h4>
                <p className="text-sm text-slate-600">Alle intellectuele eigendomsrechten op WBSO Simpel berusten bij Aanbieder of diens licentiegevers.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">Uw content</h4>
                <p className="text-sm text-slate-600">Gebruiker behoudt eigendom van zelf ingevoerde gegevens en AI-gegenereerde WBSO-documenten.</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Artikel 7: Betaling en tarieven</h2>

            <h3 className="text-xl font-medium text-slate-800 mt-6 mb-3">7.1 Tariefstructuur</h3>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-1">
              <li><strong>Gratis tier:</strong> Beperkte functionaliteit zonder kosten</li>
              <li><strong>Premium abonnementen:</strong> Volledige functionaliteit tegen maandelijkse vergoeding</li>
              <li><strong>Pay-per-use:</strong> Betaling per gegenereerde WBSO-aanvraag</li>
              <li>Actuele tarieven zijn beschikbaar op de website</li>
            </ul>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Artikel 9: Aansprakelijkheid</h2>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-800 mb-2">⚖️ Belangrijke aansprakelijkheidsbeperking:</h4>
              <p className="text-yellow-700 text-sm mb-2">Aansprakelijkheid van Aanbieder is beperkt tot:</p>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• <strong>Maximum:</strong> Het bedrag van de laatste jaarpremie</li>
                <li>• <strong>Directe schade:</strong> Uitsluitend directe schade wordt vergoed</li>
                <li>• <strong>Uitsluiting:</strong> Geen aansprakelijkheid voor indirecte schade, gevolgschade, gederfde winst</li>
              </ul>
            </div>

            <h3 className="text-xl font-medium text-slate-800 mt-6 mb-3">9.2 AI-specifieke aansprakelijkheid</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <ul className="text-blue-700 space-y-1">
                <li>• <strong>Geen garantie</strong> op juistheid van AI-output</li>
                <li>• <strong>Gebruiker verantwoordelijk</strong> voor verificatie van AI-suggesties</li>
                <li>• <strong>Geen aansprakelijkheid</strong> voor WBSO-afwijzingen door RVO</li>
                <li>• <strong>Gebruiker controleert</strong> alle gegenereerde documenten</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Artikel 11: Opzegging en beëindiging</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">Door Gebruiker</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• <strong>Maandabonnementen:</strong> 30 dagen opzegtermijn</li>
                  <li>• <strong>Jaarabonnementen:</strong> 3 maanden opzegtermijn</li>
                  <li>• <strong>Direct:</strong> Bij schending door Aanbieder</li>
                </ul>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">Gevolgen beëindiging</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• <strong>Data-export:</strong> 30 dagen mogelijk</li>
                  <li>• <strong>Verwijdering:</strong> Definitief na 30 dagen</li>
                  <li>• <strong>Betalingen:</strong> Blijven verschuldigd</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Artikel 12: Geschillenbeslechting</h2>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-800 mb-2">🏛️ Rechtsmacht en toepasselijk recht:</h4>
              <ul className="text-green-700 space-y-1">
                <li>• <strong>Toepasselijk recht:</strong> Nederlands recht</li>
                <li>• <strong>Bevoegde rechter:</strong> Arrondissementsrechtbank [Uw rechtbank]</li>
                <li>• <strong>Mediation:</strong> Eerst proberen via mediation</li>
                <li>• <strong>Consumentenbescherming:</strong> Consumenten kunnen kiezen voor hun woonplaats</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Contact voor klachten</h2>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">📧 Algemene klachten</h4>
                <p className="text-sm text-slate-600">
                  <strong>E-mail:</strong> info@wbsosimpel.nl<br />
                  <strong>Reactietermijn:</strong> 5 werkdagen
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">🔒 Privacy-klachten</h4>
                <p className="text-sm text-slate-600">
                  <strong>E-mail:</strong> privacy@wbsosimpel.nl<br />
                  <strong>Reactietermijn:</strong> 5 werkdagen
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">⚖️ Juridische vragen</h4>
                <p className="text-sm text-slate-600">
                  <strong>E-mail:</strong> legal@wbsosimpel.nl<br />
                  <strong>Voor:</strong> Contractuele geschillen
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 pt-6 mt-8">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-800 mb-2">Contact informatie</h4>
              <p className="text-slate-700">
                <strong>[Uw Bedrijfsnaam]</strong><br />
                KvK: [Nummer] • Adres: [Volledig adres]<br />
                E-mail: info@wbsosimpel.nl • Telefoon: [Nummer]
              </p>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Document versie: 1.0 • Volgende review: [Datum + 6 maanden] • Gebaseerd op Nederlands recht en GDPR-vereisten
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 