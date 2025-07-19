'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';

interface KVKCompanyData {
  kvkNummer: string;
  naam: string;
  rechtsvorm: string;
  adres: {
    straatnaam: string;
    huisnummer: number;
    postcode: string;
    plaats: string;
    land: string;
  };
  sbiActiviteiten?: Array<{
    sbiCode: string;
    sbiOmschrijving: string;
    indicatieHoofdactiviteit: boolean;
  }>;
  datumAanvang?: string;
}

interface CompanyFormData {
  // KVK Data
  kvkNumber: string;
  companyName: string;
  legalForm: string;
  
  // Address
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
  
  // Business details
  industry: string;
  sbiCodes: string[];
  foundingDate: string;
  
  // Contact
  website: string;
  phone: string;
  email: string;
  
  // R&D specifics for WBSO
  hasRnDDepartment: boolean;
  rndEmployees: number;
  previousWBSOApplications: boolean;
  annualTurnover: string;
}

const CompanySetupWizard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isKVKLoading, setIsKVKLoading] = useState(false);
  const [kvkError, setKvkError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>({
    kvkNumber: '',
    companyName: '',
    legalForm: '',
    street: '',
    houseNumber: '',
    postalCode: '',
    city: '',
    country: 'Nederland',
    industry: '',
    sbiCodes: [],
    foundingDate: '',
    website: '',
    phone: '',
    email: user?.email || '',
    hasRnDDepartment: false,
    rndEmployees: 0,
    previousWBSOApplications: false,
    annualTurnover: ''
  });

  const steps = [
    { id: 1, titleKey: 'company.setup.step1.title', descKey: 'company.setup.step1.description' },
    { id: 2, titleKey: 'company.setup.step2.title', descKey: 'company.setup.step2.description' },
    { id: 3, titleKey: 'company.setup.step3.title', descKey: 'company.setup.step3.description' },
    { id: 4, titleKey: 'company.setup.step4.title', descKey: 'company.setup.step4.description' }
  ];

  // Mock KVK API call - replace with real implementation when API key is available
  const fetchKVKData = async (kvkNumber: string): Promise<KVKCompanyData | null> => {
    setIsKVKLoading(true);
    setKvkError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if KVK API key is available
      if (!process.env.NEXT_PUBLIC_KVK_API_KEY) {
        // Mock data for demo purposes
        const mockData: KVKCompanyData = {
          kvkNummer: kvkNumber,
          naam: "Innovatieve Technologie B.V.",
          rechtsvorm: "Besloten Vennootschap",
          adres: {
            straatnaam: "Science Park",
            huisnummer: 123,
            postcode: "1098XG",
            plaats: "Amsterdam",
            land: "Nederland"
          },
          sbiActiviteiten: [
            {
              sbiCode: "62010",
              sbiOmschrijving: "Ontwikkelen, produceren en uitgeven van software",
              indicatieHoofdactiviteit: true
            }
          ],
          datumAanvang: "20200115"
        };
        return mockData;
      }

      // Real KVK API implementation (when API key is available)
      const response = await fetch(`https://api.kvk.nl/api/v2/zoeken?kvknummer=${kvkNumber}`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_KVK_API_KEY!
        }
      });

      if (!response.ok) {
        throw new Error('KVK API error');
      }

      const searchResult = await response.json();
      
      if (searchResult.resultaten && searchResult.resultaten.length > 0) {
        const company = searchResult.resultaten[0];
        
        // Get detailed company profile
        const profileResponse = await fetch(`https://api.kvk.nl/api/v1/basisprofielen/${company.kvkNummer}`, {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_KVK_API_KEY!
          }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          return {
            kvkNummer: profileData.kvkNummer,
            naam: profileData.naam,
            rechtsvorm: profileData.rechtsvorm,
            adres: profileData.adressen?.[0] || {},
            sbiActiviteiten: profileData.sbiActiviteiten || [],
            datumAanvang: profileData.datumAanvang
          };
        }
      }

      throw new Error('Company not found');
    } catch (error) {
      console.error('KVK API Error:', error);
      setKvkError(t('company.kvkError'));
      return null;
    } finally {
      setIsKVKLoading(false);
    }
  };

  const handleKVKLookup = async () => {
    if (!formData.kvkNumber || formData.kvkNumber.length !== 8) {
      setKvkError(t('company.invalidKvkNumber'));
      return;
    }

    const kvkData = await fetchKVKData(formData.kvkNumber);
    
    if (kvkData) {
      setFormData(prev => ({
        ...prev,
        companyName: kvkData.naam,
        legalForm: kvkData.rechtsvorm,
        street: kvkData.adres.straatnaam,
        houseNumber: kvkData.adres.huisnummer?.toString() || '',
        postalCode: kvkData.adres.postcode,
        city: kvkData.adres.plaats,
        country: kvkData.adres.land,
        industry: kvkData.sbiActiviteiten?.[0]?.sbiOmschrijving || '',
        sbiCodes: kvkData.sbiActiviteiten?.map(sbi => sbi.sbiCode) || [],
        foundingDate: kvkData.datumAanvang ? 
          `${kvkData.datumAanvang.substring(0,4)}-${kvkData.datumAanvang.substring(4,6)}-${kvkData.datumAanvang.substring(6,8)}` : ''
      }));
    }
  };

  const updateFormData = (field: keyof CompanyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Save company data to Firebase/database
    console.log('Saving company data:', formData);
    // Redirect to dashboard
    window.location.href = '/dashboard';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('company.kvkNumber')}
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={formData.kvkNumber}
                  onChange={(e) => updateFormData('kvkNumber', e.target.value)}
                  placeholder="12345678"
                  maxLength={8}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleKVKLookup}
                  disabled={isKVKLoading || !formData.kvkNumber}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  {isKVKLoading ? t('common.loading') : t('company.lookup')}
                </button>
              </div>
              {!process.env.NEXT_PUBLIC_KVK_API_KEY && (
                <p className="text-sm text-amber-600 mt-2">
                  🧪 {t('company.demoMode')}
                </p>
              )}
              {kvkError && (
                <p className="text-sm text-red-600 mt-2">{kvkError}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('company.name')}
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateFormData('companyName', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('company.legalForm')}
                </label>
                <input
                  type="text"
                  value={formData.legalForm}
                  onChange={(e) => updateFormData('legalForm', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('company.street')}
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => updateFormData('street', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('company.houseNumber')}
                </label>
                <input
                  type="text"
                  value={formData.houseNumber}
                  onChange={(e) => updateFormData('houseNumber', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('company.postalCode')}
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => updateFormData('postalCode', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('company.city')}
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('company.website')}
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateFormData('website', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('company.phone')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="+31 20 123 4567"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('company.email')}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('company.industry')}
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => updateFormData('industry', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('company.annualTurnover')}
              </label>
              <select
                value={formData.annualTurnover}
                onChange={(e) => updateFormData('annualTurnover', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('common.select')}</option>
                <option value="0-100k">€0 - €100K</option>
                <option value="100k-500k">€100K - €500K</option>
                <option value="500k-1m">€500K - €1M</option>
                <option value="1m-5m">€1M - €5M</option>
                <option value="5m+">€5M+</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.hasRnDDepartment}
                    onChange={(e) => updateFormData('hasRnDDepartment', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{t('company.hasRnDDepartment')}</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.previousWBSOApplications}
                    onChange={(e) => updateFormData('previousWBSOApplications', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{t('company.previousWBSOApplications')}</span>
                </label>
              </div>
            </div>

            {formData.hasRnDDepartment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('company.rndEmployees')}
                </label>
                <input
                  type="number"
                  value={formData.rndEmployees}
                  onChange={(e) => updateFormData('rndEmployees', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                {t('company.setup.review.title')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{t('company.basicInfo')}</h4>
                  <p><strong>{t('company.name')}:</strong> {formData.companyName}</p>
                  <p><strong>{t('company.kvkNumber')}:</strong> {formData.kvkNumber}</p>
                  <p><strong>{t('company.legalForm')}:</strong> {formData.legalForm}</p>
                  <p><strong>{t('company.industry')}:</strong> {formData.industry}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{t('company.contactInfo')}</h4>
                  <p><strong>{t('company.address')}:</strong> {formData.street} {formData.houseNumber}, {formData.postalCode} {formData.city}</p>
                  <p><strong>{t('company.email')}:</strong> {formData.email}</p>
                  <p><strong>{t('company.phone')}:</strong> {formData.phone}</p>
                  <p><strong>{t('company.website')}:</strong> {formData.website}</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2">{t('company.wbsoInfo')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <p><strong>{t('company.hasRnDDepartment')}:</strong> {formData.hasRnDDepartment ? t('common.yes') : t('common.no')}</p>
                  {formData.hasRnDDepartment && (
                    <p><strong>{t('company.rndEmployees')}:</strong> {formData.rndEmployees}</p>
                  )}
                  <p><strong>{t('company.previousWBSOApplications')}:</strong> {formData.previousWBSOApplications ? t('common.yes') : t('common.no')}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                {t('company.setup.review.disclaimer')}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex-1">
              <div className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-1 mx-4
                    ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-900">{t(step.titleKey)}</p>
                <p className="text-xs text-gray-500">{t(step.descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {t(steps[currentStep - 1].titleKey)}
        </h2>
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('common.previous')}
        </button>
        
        {currentStep < steps.length ? (
          <button
            onClick={nextStep}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
          >
            {t('common.next')}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
          >
            {t('company.setup.complete')}
          </button>
        )}
      </div>
    </div>
  );
};

export default CompanySetupWizard; 