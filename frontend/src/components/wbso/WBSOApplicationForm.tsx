'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';

interface WBSOFormData {
  // Project Basic Info
  projectTitle: string;
  projectType: 'development' | 'research' | '';
  applicationPeriod: {
    startDate: string;
    endDate: string;
  };
  
  // Project Description
  projectDescription: string;
  technicalChallenge: string;
  innovativeAspects: string;
  expectedResults: string;
  businessContext: string;
  
  // R&D Activities
  activities: Array<{
    id: string;
    description: string;
    startDate: string;
    endDate: string;
    hours: number;
    personnel: string[];
  }>;
  
  // Personnel
  personnel: Array<{
    id: string;
    name: string;
    role: string;
    qualification: string;
    hourlyRate: number;
    plannedHours: number;
  }>;
  
  // Cost Calculation
  costMethod: 'fixed' | 'actual';
  totalHours: number;
  totalLaborCosts: number;
  otherCosts: Array<{
    id: string;
    description: string;
    amount: number;
    justification: string;
  }>;
  
  // Technical Details
  currentSituation: string;
  targetSituation: string;
  technicalRisks: string;
  previousAttempts: string;
  literatureReview: string;
  
  // Administration
  projectAdministration: string;
  timeRegistration: string;
  costRegistration: string;
}

const WBSOApplicationForm: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [currentSection, setCurrentSection] = useState(1);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [formData, setFormData] = useState<WBSOFormData>({
    projectTitle: '',
    projectType: '',
    applicationPeriod: {
      startDate: '',
      endDate: ''
    },
    projectDescription: '',
    technicalChallenge: '',
    innovativeAspects: '',
    expectedResults: '',
    businessContext: '',
    activities: [],
    personnel: [],
    costMethod: 'fixed',
    totalHours: 0,
    totalLaborCosts: 0,
    otherCosts: [],
    currentSituation: '',
    targetSituation: '',
    technicalRisks: '',
    previousAttempts: '',
    literatureReview: '',
    projectAdministration: '',
    timeRegistration: '',
    costRegistration: ''
  });

  const sections = [
    { id: 1, titleKey: 'wbso.sections.basics', descKey: 'wbso.sections.basicsDesc' },
    { id: 2, titleKey: 'wbso.sections.description', descKey: 'wbso.sections.descriptionDesc' },
    { id: 3, titleKey: 'wbso.sections.activities', descKey: 'wbso.sections.activitiesDesc' },
    { id: 4, titleKey: 'wbso.sections.personnel', descKey: 'wbso.sections.personnelDesc' },
    { id: 5, titleKey: 'wbso.sections.costs', descKey: 'wbso.sections.costsDesc' },
    { id: 6, titleKey: 'wbso.sections.technical', descKey: 'wbso.sections.technicalDesc' },
    { id: 7, titleKey: 'wbso.sections.review', descKey: 'wbso.sections.reviewDesc' }
  ];

  const updateFormData = (field: keyof WBSOFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedFormData = (field: keyof WBSOFormData, subField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...(prev[field] as any),
        [subField]: value
      }
    }));
  };

  const addActivity = () => {
    const newActivity = {
      id: Date.now().toString(),
      description: '',
      startDate: '',
      endDate: '',
      hours: 0,
      personnel: []
    };
    setFormData(prev => ({
      ...prev,
      activities: [...prev.activities, newActivity]
    }));
  };

  const removeActivity = (id: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter(activity => activity.id !== id)
    }));
  };

  const addPersonnel = () => {
    const newPerson = {
      id: Date.now().toString(),
      name: '',
      role: '',
      qualification: '',
      hourlyRate: 0,
      plannedHours: 0
    };
    setFormData(prev => ({
      ...prev,
      personnel: [...prev.personnel, newPerson]
    }));
  };

  const removePersonnel = (id: string) => {
    setFormData(prev => ({
      ...prev,
      personnel: prev.personnel.filter(person => person.id !== id)
    }));
  };

  const generateAIContent = async (field: string, context?: string) => {
    setIsGeneratingAI(true);
    
    // Simulate AI generation - replace with real AI API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiContent = {
        projectDescription: "Dit innovatieve project richt zich op de ontwikkeling van een geavanceerd machine learning platform voor real-time data analyse. Het project omvat onderzoek naar nieuwe algoritmen voor patroonherkenning en de implementatie van schaalbare cloud-architectuur. De technische uitdaging ligt in het combineren van verschillende AI-technieken om accurate voorspellingen te kunnen doen met minimale latency.",
        technicalChallenge: "De hoofduitdaging is het ontwikkelen van algoritmen die kunnen leren van streaming data terwijl ze tegelijkertijd real-time voorspellingen leveren. Dit vereist innovatieve technieken voor online learning en distributed computing. Bestaande oplossingen kunnen niet omgaan met de combinatie van snelheid en nauwkeurigheid die wij nastreven.",
        innovativeAspects: "Het project introduceert een nieuwe hybride architectuur die edge computing combineert met cloud-based AI. Dit is technisch nieuw omdat het de voordelen van lokale verwerking (lage latency) combineert met de kracht van cloud computing (schaalbaarheid en complexe modellen). De ontwikkelde algoritmen zijn een significante verbetering ten opzichte van de huidige stand van de techniek."
      };
      
      if (aiContent[field as keyof typeof aiContent]) {
        updateFormData(field as keyof WBSOFormData, aiContent[field as keyof typeof aiContent]);
      }
    } catch (error) {
      console.error('AI generation error:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const calculateTotalCosts = () => {
    const laborCosts = formData.personnel.reduce((total, person) => 
      total + (person.hourlyRate * person.plannedHours), 0
    );
    const otherCostTotal = formData.otherCosts.reduce((total, cost) => total + cost.amount, 0);
    return laborCosts + otherCostTotal;
  };

  const generatePDF = () => {
    // PDF generation logic will be implemented here
    console.log('Generating PDF with form data:', formData);
    alert(t('wbso.pdfGenerated'));
  };

  const nextSection = () => {
    if (currentSection < sections.length) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const renderSectionContent = () => {
    switch (currentSection) {
      case 1: // Basics
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('wbso.projectTitle')}
              </label>
              <input
                type="text"
                value={formData.projectTitle}
                onChange={(e) => updateFormData('projectTitle', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('wbso.projectTitlePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('wbso.projectType')}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="projectType"
                    value="development"
                    checked={formData.projectType === 'development'}
                    onChange={(e) => updateFormData('projectType', e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{t('wbso.developmentProject')}</div>
                    <div className="text-sm text-gray-500">{t('wbso.developmentProjectDesc')}</div>
                  </div>
                </label>
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="projectType"
                    value="research"
                    checked={formData.projectType === 'research'}
                    onChange={(e) => updateFormData('projectType', e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{t('wbso.researchProject')}</div>
                    <div className="text-sm text-gray-500">{t('wbso.researchProjectDesc')}</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('wbso.startDate')}
                </label>
                <input
                  type="date"
                  value={formData.applicationPeriod.startDate}
                  onChange={(e) => updateNestedFormData('applicationPeriod', 'startDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('wbso.endDate')}
                </label>
                <input
                  type="date"
                  value={formData.applicationPeriod.endDate}
                  onChange={(e) => updateNestedFormData('applicationPeriod', 'endDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 2: // Description
        return (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('wbso.projectDescription')}
                </label>
                <button
                  onClick={() => generateAIContent('projectDescription')}
                  disabled={isGeneratingAI}
                  className="text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded-md"
                >
                  {isGeneratingAI ? t('ai.generating') : t('wbso.generateWithAI')}
                </button>
              </div>
              <textarea
                value={formData.projectDescription}
                onChange={(e) => updateFormData('projectDescription', e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('wbso.projectDescriptionPlaceholder')}
              />
              <p className="text-xs text-gray-500 mt-1">{t('wbso.descriptionHint')}</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('wbso.technicalChallenge')}
                </label>
                <button
                  onClick={() => generateAIContent('technicalChallenge')}
                  disabled={isGeneratingAI}
                  className="text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded-md"
                >
                  {isGeneratingAI ? t('ai.generating') : t('wbso.generateWithAI')}
                </button>
              </div>
              <textarea
                value={formData.technicalChallenge}
                onChange={(e) => updateFormData('technicalChallenge', e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('wbso.technicalChallengePlaceholder')}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('wbso.innovativeAspects')}
                </label>
                <button
                  onClick={() => generateAIContent('innovativeAspects')}
                  disabled={isGeneratingAI}
                  className="text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded-md"
                >
                  {isGeneratingAI ? t('ai.generating') : t('wbso.generateWithAI')}
                </button>
              </div>
              <textarea
                value={formData.innovativeAspects}
                onChange={(e) => updateFormData('innovativeAspects', e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('wbso.innovativeAspectsPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('wbso.expectedResults')}
              </label>
              <textarea
                value={formData.expectedResults}
                onChange={(e) => updateFormData('expectedResults', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('wbso.expectedResultsPlaceholder')}
              />
            </div>
          </div>
        );

      case 3: // Activities
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">{t('wbso.rdActivities')}</h3>
              <button
                onClick={addActivity}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              >
                {t('wbso.addActivity')}
              </button>
            </div>

            {formData.activities.map((activity, index) => (
              <div key={activity.id} className="border border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">{t('wbso.activity')} {index + 1}</h4>
                  <button
                    onClick={() => removeActivity(activity.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    {t('common.delete')}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('wbso.startDate')}
                    </label>
                    <input
                      type="date"
                      value={activity.startDate}
                      onChange={(e) => {
                        const updatedActivities = formData.activities.map(a =>
                          a.id === activity.id ? { ...a, startDate: e.target.value } : a
                        );
                        updateFormData('activities', updatedActivities);
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('wbso.endDate')}
                    </label>
                    <input
                      type="date"
                      value={activity.endDate}
                      onChange={(e) => {
                        const updatedActivities = formData.activities.map(a =>
                          a.id === activity.id ? { ...a, endDate: e.target.value } : a
                        );
                        updateFormData('activities', updatedActivities);
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('wbso.activityDescription')}
                  </label>
                  <textarea
                    value={activity.description}
                    onChange={(e) => {
                      const updatedActivities = formData.activities.map(a =>
                        a.id === activity.id ? { ...a, description: e.target.value } : a
                      );
                      updateFormData('activities', updatedActivities);
                    }}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('wbso.activityDescriptionPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('wbso.estimatedHours')}
                  </label>
                  <input
                    type="number"
                    value={activity.hours}
                    onChange={(e) => {
                      const updatedActivities = formData.activities.map(a =>
                        a.id === activity.id ? { ...a, hours: parseInt(e.target.value) || 0 } : a
                      );
                      updateFormData('activities', updatedActivities);
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}

            {formData.activities.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>{t('wbso.noActivitiesYet')}</p>
                <p className="text-sm">{t('wbso.addActivitiesHint')}</p>
              </div>
            )}
          </div>
        );

      case 7: // Review & PDF Generation
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                {t('wbso.reviewTitle')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{t('wbso.projectInfo')}</h4>
                  <p><strong>{t('wbso.projectTitle')}:</strong> {formData.projectTitle}</p>
                  <p><strong>{t('wbso.projectType')}:</strong> {formData.projectType ? t(`wbso.${formData.projectType}Project`) : '-'}</p>
                  <p><strong>{t('wbso.period')}:</strong> {formData.applicationPeriod.startDate} - {formData.applicationPeriod.endDate}</p>
                  <p><strong>{t('wbso.totalActivities')}:</strong> {formData.activities.length}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{t('wbso.costSummary')}</h4>
                  <p><strong>{t('wbso.totalHours')}:</strong> {formData.activities.reduce((total, activity) => total + activity.hours, 0)}</p>
                  <p><strong>{t('wbso.personnel')}:</strong> {formData.personnel.length} {t('common.people')}</p>
                  <p><strong>{t('wbso.estimatedCosts')}:</strong> €{calculateTotalCosts().toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">{t('wbso.readyToGenerate')}</h3>
              <p className="text-gray-600">{t('wbso.pdfExplanation')}</p>
              
              <button
                onClick={generatePDF}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                📄 {t('wbso.generatePDF')}
              </button>
              
              <p className="text-sm text-gray-500">{t('wbso.pdfHint')}</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">{t('wbso.sectionInDevelopment')}</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {sections.map((section, index) => (
            <div key={section.id} className="flex-1">
              <div className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentSection >= section.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {section.id}
                </div>
                {index < sections.length - 1 && (
                  <div className={`
                    flex-1 h-1 mx-2
                    ${currentSection > section.id ? 'bg-blue-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-900">{t(section.titleKey)}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t(sections[currentSection - 1].titleKey)}
          </h1>
          <p className="text-gray-600">
            {t(sections[currentSection - 1].descKey)}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow p-8 mb-6">
        {renderSectionContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={prevSection}
          disabled={currentSection === 1}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('common.previous')}
        </button>
        
        <div className="text-sm text-gray-500">
          {currentSection} / {sections.length}
        </div>
        
        {currentSection < sections.length ? (
          <button
            onClick={nextSection}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
          >
            {t('common.next')}
          </button>
        ) : (
          <button
            onClick={generatePDF}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
          >
            {t('wbso.generatePDF')}
          </button>
        )}
      </div>
    </div>
  );
};

export default WBSOApplicationForm; 