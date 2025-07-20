'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import { useLeadConversion, type LeadData } from '@/lib/leadConversion';
import jsPDF from 'jspdf';

interface WBSOInputs {
  // Minimal user inputs - just the essentials
  projectTitle: string;
  projectType: 'development' | 'research' | '';
  startDate: string;
  endDate: string;
  
  // Company context
  companyName: string;
  companySector: string;
  teamSize: string;
  
  // Core project info
  problemDescription: string;
  proposedSolution: string;
  whyInnovative: string;
  expectedDuration: string;
  estimatedBudget: string;
}

interface GeneratedWBSODocument {
  // AI-generated complete application
  projectDescription: string;
  technicalChallenge: string;
  innovativeAspects: string;
  expectedResults: string;
  activities: Array<{
    name: string;
    description: string;
    duration: string;
    hours: number;
  }>;
  costBreakdown: {
    totalHours: number;
    laborCosts: number;
    wbsoDeduction: number;
    netCosts: number;
  };
}

const WBSOApplicationForm: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const { mapLeadToInputs, decryptToken } = useLeadConversion();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [isPreFilled, setIsPreFilled] = useState(false);
  
  // User inputs (minimal)
  const [inputs, setInputs] = useState<WBSOInputs>({
    projectTitle: '',
    projectType: '',
    startDate: '',
    endDate: '',
    companyName: '',
    companySector: '',
    teamSize: '',
    problemDescription: '',
    proposedSolution: '',
    whyInnovative: '',
    expectedDuration: '',
    estimatedBudget: ''
  });
  
  // Generated document (AI-created)
  const [document, setDocument] = useState<GeneratedWBSODocument>({
    projectDescription: '',
    technicalChallenge: '',
    innovativeAspects: '',
    expectedResults: '',
    activities: [],
    costBreakdown: {
      totalHours: 0,
      laborCosts: 0,
      wbsoDeduction: 0,
      netCosts: 0
    }
  });

  // Handle lead token pre-population on component mount
  useEffect(() => {
    if (!searchParams) return;
    
    const leadToken = searchParams.get('lead_token');
    const source = searchParams.get('source');
    
    if (leadToken && source === 'wbso_check') {
      try {
        const decryptedLead = decryptToken(leadToken);
        if (decryptedLead) {
          const mappedInputs = mapLeadToInputs(decryptedLead);
          setInputs(mappedInputs);
          setLeadData(decryptedLead);
          setIsPreFilled(true);
          
          // Show success message about pre-population
          setGenerationStatus('✅ Uw gegevens zijn automatisch ingevuld vanaf WBSO Check!');
        }
      } catch (error) {
        console.error('Failed to process lead token:', error);
        // Continue with empty form
      }
    }
  }, [searchParams, decryptToken, mapLeadToInputs]);

  // AI Agent - Generates complete WBSO application from minimal inputs
  const generateWBSODocument = async () => {
    setIsGenerating(true);
    setGenerationStatus('🤖 WBSO Agent analyseert uw project...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGenerationStatus('📝 Schrijft professionele projectbeschrijving...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setGenerationStatus('🔬 Genereert technische uitdaging sectie...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setGenerationStatus('✨ Formuleert innovatieve aspecten...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setGenerationStatus('📊 Berekent activiteiten en kosten...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate complete professional WBSO document
      const generatedDoc = await generateCompleteApplication();
      setDocument(generatedDoc);
      
      setGenerationStatus('✅ Complete WBSO-aanvraag gegenereerd!');
      setCurrentStep(3);
      
    } catch (error) {
      console.error('Generation error:', error);
      setGenerationStatus('❌ Fout bij genereren. Probeer opnieuw.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // AI Document Generator - Based on official WBSO templates
  const generateCompleteApplication = async (): Promise<GeneratedWBSODocument> => {
    const duration = parseInt(inputs.expectedDuration) || 12;
    const budget = parseInt(inputs.estimatedBudget) || 100000;
    const totalHours = Math.round(duration * 160); // ~160 hours per month
    const laborCosts = totalHours * 65; // €65/hour average
    const wbsoDeduction = Math.round(laborCosts * 0.36); // 36% WBSO reduction 2025
    
    return {
      projectDescription: `${inputs.projectTitle} is een innovatief ${inputs.projectType === 'development' ? 'ontwikkelingsproject' : 'onderzoeksproject'} van ${inputs.companyName}, een ${inputs.companySector} bedrijf.

Het project richt zich op het zelfstandig ontwikkelen van technisch nieuwe oplossingen voor ${inputs.problemDescription}. De voorgestelde technische benadering (${inputs.proposedSolution}) kan niet worden gerealiseerd met conventionele methoden of door toepassing van algemeen bekende technieken.

Dit speur- en ontwikkelingswerk (S&O) vereist systematisch onderzoek naar technische onzekerheden en risico's. Het eindresultaat zal een technisch nieuw ${inputs.projectType === 'development' ? 'product/systeem' : 'proces/methodiek'} zijn dat significant afwijkt van bestaande oplossingen.

Het project draagt bij aan de Nederlandse kenniseconomie door nieuwe technische kennis te ontwikkelen die commercieel toepasbaar is en concurrentievoordeel oplevert voor ${inputs.companyName}.`,

      technicalChallenge: `De hoofduitdaging betreft het oplossen van concrete technische problemen die met huidige methoden niet oplosbaar zijn: ${inputs.problemDescription}.

Specifieke technische risico's en onzekerheden:
• Onzekerheid over de technische haalbaarheid van ${inputs.proposedSolution}
• Integratie-uitdagingen met bestaande ${inputs.companySector} systemen
• Prestatie-optimalisatie onder specifieke technische randvoorwaarden
• Schaalbaarheid en robuustheid van de ontwikkelde oplossing

Deze technische problemen kunnen NIET worden opgelost door:
- Het kopiëren of imiteren van bestaande technologie
- Het toepassen van standaard engineering principes  
- Het gebruik van commercieel beschikbare oplossingen

${inputs.whyInnovative}

Er is fundamenteel onderzoek en experimentele ontwikkeling nodig om tot een werkende, technisch nieuwe oplossing te komen.`,

      innovativeAspects: `Dit project is technisch nieuw omdat het nieuwe principes en methoden ontwikkelt die niet bestaan in de huidige stand van de techniek:

1. **Technische Nieuwheid**: ${inputs.whyInnovative} - dit biedt een significante verbetering ten opzichte van bestaande oplossingen in de ${inputs.companySector} sector.

2. **Zelfstandige Probleemoplossing**: De technische uitdagingen worden zelfstandig opgelost zonder gebruik van bestaande commerciële oplossingen of het kopiëren van bekende technieken.

3. **Systematische R&D Aanpak**: Het project volgt een methodische onderzoeks- en ontwikkelingsaanpak om technische onzekerheden stap voor stap af te bouwen.

4. **Intellectueel Eigendom**: De ontwikkelde technologie zal leiden tot nieuwe kennis en mogelijk tot intellectuele eigendomsrechten voor ${inputs.companyName}.

5. **Marktdifferentiatie**: De innovatie positioneert ${inputs.companyName} als technologieleider in ${inputs.companySector} door het aanbieden van unieke oplossingen.

Het verschil met bestaande methoden ligt in het unieke vermogen om ${inputs.problemDescription} op te lossen met ${inputs.proposedSolution}, wat met conventionele technieken niet mogelijk is.`,

      expectedResults: `Dit ${duration}-maanden durende onderzoeks- en ontwikkelingsproject zal leiden tot:

• **Technisch Nieuw Product/Proces**: Een werkend prototype/systeem dat ${inputs.problemDescription} oplost
• **Nieuwe Technische Kennis**: Bewezen methodieken en principes voor ${inputs.proposedSolution}
• **Commerciële Toepasbaarheid**: Basis voor marktintroductie en commerciële exploitatie
• **Intellectueel Eigendom**: Documentatie van innovatieve bevindingen en mogelijk patenteerbare technologie
• **Concurrentievoordeel**: Technologische voorsprong voor ${inputs.companyName} in de ${inputs.companySector} markt

**Verwachte Technische Prestaties**:
- Significante verbetering in [specifieke parameters] ten opzichte van huidige oplossingen
- Bewezen haalbaarheid van ${inputs.proposedSolution}
- Gevalideerde implementatie binnen ${inputs.companySector} context

**Business Impact**:
- Nieuwe productmogelijkheden en omzetstromen
- Versterkte marktpositie en differentiatie
- Bijdrage aan R&D-capaciteit van ${inputs.teamSize} specialisten`,

      activities: inputs.projectType === 'development' ? [
        {
          name: 'Technische Haalbaarheidsanalyse',
          description: `Systematisch onderzoek naar de technische haalbaarheid van ${inputs.proposedSolution} voor ${inputs.problemDescription}. Includeert risico-evaluatie, technische specificaties en architectuurontwerp.`,
          duration: `Maand 1-${Math.ceil(duration * 0.25)}`,
          hours: Math.round(totalHours * 0.2)
        },
        {
          name: 'Prototype Ontwikkeling',
          description: `Experimentele ontwikkeling van werkende prototypes en proof-of-concept implementaties. Testing van kernfunctionaliteiten en validatie van technische aannames.`,
          duration: `Maand ${Math.ceil(duration * 0.25)}-${Math.ceil(duration * 0.75)}`,
          hours: Math.round(totalHours * 0.5)
        },
        {
          name: 'Optimalisatie en Validatie',
          description: `Prestatie-optimalisatie, robuustheidstest en validatie van de technische oplossing onder realistische omstandigheden. Documentatie van bevindingen en resultaten.`,
          duration: `Maand ${Math.ceil(duration * 0.75)}-${duration}`,
          hours: Math.round(totalHours * 0.3)
        }
      ] : [
        {
          name: 'Literatuuronderzoek en State-of-the-Art Analyse',
          description: `Uitgebreid onderzoek naar bestaande kennis en technieken gerelateerd aan ${inputs.problemDescription}. Identificatie van kennislacunes en onderzoeksmogelijkheden.`,
          duration: `Maand 1-${Math.ceil(duration * 0.3)}`,
          hours: Math.round(totalHours * 0.15)
        },
        {
          name: 'Experimenteel Onderzoek',
          description: `Systematische experimenten en tests om nieuwe principes en methoden te ontwikkelen voor ${inputs.proposedSolution}. Hypothese testing en data analyse.`,
          duration: `Maand ${Math.ceil(duration * 0.3)}-${Math.ceil(duration * 0.8)}`,
          hours: Math.round(totalHours * 0.6)
        },
        {
          name: 'Validatie en Documentatie',
          description: `Validatie van onderzoeksresultaten, documentatie van nieuwe kennis en voorbereiding voor praktische implementatie. Rapportage en kennisoverdracht.`,
          duration: `Maand ${Math.ceil(duration * 0.8)}-${duration}`,
          hours: Math.round(totalHours * 0.25)
        }
      ],

      costBreakdown: {
        totalHours,
        laborCosts,
        wbsoDeduction,
        netCosts: laborCosts - wbsoDeduction
      }
    };
  };

  const updateInput = (field: keyof WBSOInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const generatePDF = () => {
    try {
      const pdf = new jsPDF();
      let yPosition = 20;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      
      const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", isBold ? "bold" : "normal");
        
        const lines = pdf.splitTextToSize(text, 170);
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * (fontSize * 0.4) + 5;
      };
      
      // Header
      addText("WBSO AANVRAAG 2025", 20, true);
      addText("Speur- en Ontwikkelingswerk (S&O)", 14, false);
      addText(`${inputs.companyName} - ${inputs.companySector}`, 12, false);
      yPosition += 10;
      
      // Project Info
      addText("PROJECTINFORMATIE", 16, true);
      addText(`Projecttitel: ${inputs.projectTitle}`, 12, false);
      addText(`Type: ${inputs.projectType === 'development' ? 'Ontwikkelingsproject' : 'Technisch-wetenschappelijk onderzoek'}`, 12, false);
      addText(`Periode: ${inputs.startDate} tot ${inputs.endDate}`, 12, false);
      addText(`Team: ${inputs.teamSize}`, 12, false);
      yPosition += 10;
      
      // Generated sections
      addText("PROJECTBESCHRIJVING", 16, true);
      addText(document.projectDescription, 11, false);
      yPosition += 10;
      
      addText("TECHNISCHE UITDAGING", 16, true);
      addText(document.technicalChallenge, 11, false);
      yPosition += 10;
      
      addText("INNOVATIEVE ASPECTEN", 16, true);
      addText(document.innovativeAspects, 11, false);
      yPosition += 10;
      
      addText("VERWACHTE RESULTATEN", 16, true);
      addText(document.expectedResults, 11, false);
      yPosition += 10;
      
      // Activities
      addText("SPEUR- EN ONTWIKKELINGSACTIVITEITEN", 16, true);
      document.activities.forEach((activity, index) => {
        addText(`S&O Activiteit ${index + 1}: ${activity.name}`, 12, true);
        addText(`Periode: ${activity.duration}`, 11, false);
        addText(`Geschatte uren: ${activity.hours}`, 11, false);
        addText(`Beschrijving: ${activity.description}`, 11, false);
        yPosition += 5;
      });
      
      // Cost summary
      yPosition += 10;
      addText("WBSO KOSTENVOORDEEL", 16, true);
      addText(`Totaal S&O-uren: ${document.costBreakdown.totalHours}`, 12, false);
      addText(`S&O-loonkosten: €${document.costBreakdown.laborCosts.toLocaleString()}`, 12, false);
      addText(`WBSO-aftrek (36%): €${document.costBreakdown.wbsoDeduction.toLocaleString()}`, 12, true);
      addText(`Netto S&O-kosten: €${document.costBreakdown.netCosts.toLocaleString()}`, 12, true);
      
      // Footer
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "italic");
      pdf.text(`Gegenereerd door WBSO Simpel op: ${new Date().toLocaleDateString('nl-NL')}`, margin, pageHeight - 15);
      pdf.text("Professional WBSO Application Platform", margin, pageHeight - 10);
      
      const fileName = `WBSO_${inputs.projectTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      alert('✅ Complete WBSO-aanvraag PDF gedownload!');
    } catch (error) {
      console.error('PDF error:', error);
      alert('❌ Fout bij PDF genereren');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Smart Input Form - Adaptive based on user source
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                {isPreFilled ? '🎯 Laatste details voor uw WBSO-aanvraag' : '📝 Vul de basisgegevens in'}
              </h3>
              <p className="text-blue-700">
                {isPreFilled 
                  ? 'Wij hebben uw gegevens van de WBSO Check. Vul alleen de ontbrekende details aan.'
                  : 'Onze AI-agent schrijft automatisch uw complete WBSO-aanvraag in professioneel Nederlands.'
                }
              </p>
              {isPreFilled && leadData && (
                <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">
                    ✅ Reeds bekend van WBSO Check
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-green-700">
                    <div>
                      <p><strong>Bedrijf:</strong> {leadData.company_name}</p>
                      <p><strong>Sector:</strong> {leadData.sbi_description}</p>
                      <p><strong>Team:</strong> {leadData.technical_staff_count} personen</p>
                    </div>
                    <div>
                      <p><strong>Berekende subsidie:</strong> €{leadData.calculated_subsidy?.toLocaleString()}</p>
                      <p><strong>Project type:</strong> {inputs.projectType === 'development' ? 'Ontwikkeling' : 'Onderzoek'}</p>
                      <p><strong>Duur:</strong> {inputs.expectedDuration} maanden</p>
                    </div>
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    💡 U hoeft deze gegevens niet opnieuw in te vullen!
                  </p>
                </div>
              )}
            </div>

            {/* Conditional rendering based on lead source */}
            {isPreFilled ? (
              // MINIMAL FORM for lead magnet users
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    🎯 Alleen deze details ontbreken nog
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Geef uw project een naam
                      </label>
                      <input
                        type="text"
                        value={inputs.projectTitle}
                        onChange={(e) => updateInput('projectTitle', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`${inputs.companyName} ${leadData?.technical_problems?.[0] || 'innovatie'} project`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Bijvoorbeeld: "{inputs.companyName} AI automatisering" of "Slimme voorraad optimalisatie"
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Beschrijf kort uw specifieke technische oplossing
                      </label>
                      <textarea
                        value={inputs.proposedSolution}
                        onChange={(e) => updateInput('proposedSolution', e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Hybride AI-systeem dat machine learning combineert met real-time data voor automatische voorspellingen"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Tip: Beschrijf de technische aanpak, niet het probleem (dat kennen we al)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Waarom is deze technische oplossing nieuw/innovatief?
                      </label>
                      <textarea
                        value={inputs.whyInnovative}
                        onChange={(e) => updateInput('whyInnovative', e.target.value)}
                        rows={2}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Bestaande oplossingen kunnen niet omgaan met real-time aanpassingen en complexe voorspellingen tegelijkertijd"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gewenste start datum
                        </label>
                        <input
                          type="date"
                          value={inputs.startDate}
                          onChange={(e) => updateInput('startDate', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Verwachte eind datum
                        </label>
                        <input
                          type="date"
                          value={inputs.endDate}
                          onChange={(e) => updateInput('endDate', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-800 mb-2">⚡ Snellere aanvraag dankzij WBSO Check</h5>
                  <p className="text-sm text-blue-700">
                    Normaal zouden we 12+ vragen stellen, maar dankzij uw WBSO Check hoeven we alleen 
                    deze 4 details nog te weten. De rest wordt automatisch ingevuld! 🚀
                  </p>
                </div>
              </div>
            ) : (
              // FULL FORM for direct users
              <div className="space-y-6">
                {/* Project Basics */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Project Informatie</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project naam
                      </label>
                      <input
                        type="text"
                        value={inputs.projectTitle}
                        onChange={(e) => updateInput('projectTitle', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="AI-gedreven voorraadoptimalisatie"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type project
                      </label>
                      <select
                        value={inputs.projectType}
                        onChange={(e) => updateInput('projectType', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecteer</option>
                        <option value="development">Ontwikkelingsproject</option>
                        <option value="research">Technisch onderzoek</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start datum
                      </label>
                      <input
                        type="date"
                        value={inputs.startDate}
                        onChange={(e) => updateInput('startDate', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Eind datum
                      </label>
                      <input
                        type="date"
                        value={inputs.endDate}
                        onChange={(e) => updateInput('endDate', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Info */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Bedrijf</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bedrijfsnaam
                      </label>
                      <input
                        type="text"
                        value={inputs.companyName}
                        onChange={(e) => updateInput('companyName', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="TechNova B.V."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sector/Branche
                      </label>
                      <input
                        type="text"
                        value={inputs.companySector}
                        onChange={(e) => updateInput('companySector', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Software ontwikkeling"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        R&D Team
                      </label>
                      <input
                        type="text"
                        value={inputs.teamSize}
                        onChange={(e) => updateInput('teamSize', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="3 developers, 1 data scientist"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Geschat budget (€)
                      </label>
                      <input
                        type="number"
                        value={inputs.estimatedBudget}
                        onChange={(e) => updateInput('estimatedBudget', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="150000"
                      />
                    </div>
                  </div>
                </div>

                {/* Project Content */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Project Inhoud</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Welk technisch probleem lost u op?
                      </label>
                      <textarea
                        value={inputs.problemDescription}
                        onChange={(e) => updateInput('problemDescription', e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Voorraadniveaus voorspellen met onvoorspelbare vraagpatronen en seizoensinvloeden"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wat is uw technische oplossing?
                      </label>
                      <textarea
                        value={inputs.proposedSolution}
                        onChange={(e) => updateInput('proposedSolution', e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Hybride AI-algoritme dat deep learning combineert met real-time marktdata en externe factoren"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Waarom is dit technisch nieuw/innovatief?
                      </label>
                      <textarea
                        value={inputs.whyInnovative}
                        onChange={(e) => updateInput('whyInnovative', e.target.value)}
                        rows={2}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Bestaande methoden kunnen niet omgaan met real-time aanpassingen en multi-variabele voorspellingen"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Projectduur (maanden)
                        </label>
                        <input
                          type="number"
                          value={inputs.expectedDuration}
                          onChange={(e) => updateInput('expectedDuration', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="18"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-medium text-yellow-800 mb-2">💡 Tip: Bespaar tijd met onze WBSO Check</h5>
                  <p className="text-sm text-yellow-700">
                    Wist u dat u deze vragen kunt overslaan door eerst onze <strong>gratis WBSO Check</strong> te doen? 
                    Dan vullen we automatisch 80% van deze gegevens in! 
                    <a href="/wbso-check" className="underline font-medium">Probeer de WBSO Check →</a>
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 2: // AI Generation
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                🤖 AI Agent schrijft uw WBSO-aanvraag
              </h3>
              <p className="text-gray-600 mb-8">
                Uw basis inputs worden omgezet naar een complete, professionele WBSO-aanvraag in het Nederlands.
              </p>
              
              <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-2xl mx-auto">
                <div className="flex items-center justify-center mb-6">
                  {isGenerating ? (
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                  ) : (
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-3xl">✅</span>
                    </div>
                  )}
                </div>
                
                <p className="text-lg text-gray-700 mb-6">
                  {generationStatus || 'Klaar om uw WBSO-aanvraag te genereren'}
                </p>
                
                {!isGenerating && !document.projectDescription && (
                  <button
                    onClick={generateWBSODocument}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg"
                  >
                    🚀 Genereer Complete WBSO Aanvraag
                  </button>
                )}
                
                {isGenerating && (
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>⏱️ Gemiddelde tijd: 30-45 seconden</p>
                    <p>📄 Genereert: Volledige aanvraag + activiteiten + kosten</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3: // Review & Download
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                ✅ Uw complete WBSO-aanvraag is klaar!
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Project</h4>
                  <p><strong>Titel:</strong> {inputs.projectTitle}</p>
                  <p><strong>Bedrijf:</strong> {inputs.companyName}</p>
                  <p><strong>Type:</strong> {inputs.projectType === 'development' ? 'Ontwikkeling' : 'Onderzoek'}</p>
                  <p><strong>Duur:</strong> {inputs.expectedDuration} maanden</p>
                  <p><strong>Activiteiten:</strong> {document.activities.length}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">WBSO Voordelen 2025</h4>
                  <p><strong>Totaal uren:</strong> {document.costBreakdown.totalHours}</p>
                  <p><strong>S&O kosten:</strong> €{document.costBreakdown.laborCosts.toLocaleString()}</p>
                  <p><strong>WBSO aftrek (36%):</strong> €{document.costBreakdown.wbsoDeduction.toLocaleString()}</p>
                  <p className="text-green-600 font-semibold">
                    <strong>Uw besparing:</strong> €{document.costBreakdown.wbsoDeduction.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Preview sections */}
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">📋 Projectbeschrijving (preview)</h4>
                <p className="text-sm text-gray-600">
                  {document.projectDescription.substring(0, 150)}...
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">🔬 Gegenereerde Activiteiten</h4>
                <div className="space-y-2">
                  {document.activities.map((activity, index) => (
                    <div key={index} className="text-sm">
                      <strong>{activity.name}</strong> - {activity.hours} uren ({activity.duration})
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Download uw professionele WBSO-aanvraag</h3>
              <p className="text-gray-600">Volledig uitgewerkt, klaar voor indienen bij RVO</p>
              
              <button
                onClick={generatePDF}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg"
              >
                📄 Download Complete WBSO Aanvraag
              </button>
              
              <div className="text-sm text-gray-500 space-y-1">
                <p>✅ Professioneel Nederlands • ✅ RVO compliant • ✅ Inclusief kostenvoordeel</p>
                <p>PDF bevat: Volledige beschrijving, activiteiten, innovatie-aspecten en WBSO berekening</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    if (currentStep === 1) {
      if (isPreFilled) {
        // Lead magnet users: Only need project title, solution, innovation reason, and dates
        return inputs.projectTitle && inputs.proposedSolution && inputs.whyInnovative && 
               inputs.startDate && inputs.endDate;
      } else {
        // Direct users: Need all basic information
        return inputs.projectTitle && inputs.projectType && inputs.companyName && 
               inputs.problemDescription && inputs.proposedSolution && inputs.whyInnovative;
      }
    }
    return true;
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {(isPreFilled ? [
            { step: 1, title: 'Details Aanvullen', desc: 'Laatste gegevens invullen' },
            { step: 2, title: 'AI Generatie', desc: 'Agent schrijft aanvraag' },
            { step: 3, title: 'Download', desc: 'Complete WBSO PDF' }
          ] : [
            { step: 1, title: 'Basis Gegevens', desc: 'Vul eenvoudige velden in' },
            { step: 2, title: 'AI Generatie', desc: 'Agent schrijft aanvraag' },
            { step: 3, title: 'Download', desc: 'Complete WBSO PDF' }
          ]).map((item, index) => (
            <div key={item.step} className="flex-1">
              <div className="flex items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= item.step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {currentStep > item.step ? '✓' : item.step}
                </div>
                {index < 2 && (
                  <div className={`
                    flex-1 h-1 mx-4
                    ${currentStep > item.step ? 'bg-blue-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
              <div className="mt-2 text-center">
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50 rounded-lg shadow-lg p-8 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Vorige
        </button>
        
        <div className="text-sm text-gray-500">
          Stap {currentStep} van 3
        </div>
        
        {currentStep === 1 ? (
          <button
            onClick={nextStep}
            disabled={!isStepValid()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPreFilled ? 'Aanvraag Genereren ⚡' : 'Volgende: Genereren →'}
          </button>
        ) : currentStep === 2 ? (
          <div></div>
        ) : (
          <button
            onClick={generatePDF}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
          >
            📄 Download PDF
          </button>
        )}
      </div>
    </div>
  );
};

export default WBSOApplicationForm; 