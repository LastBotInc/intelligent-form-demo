"use client";

import { useState } from 'react';
import AIAssistant from './AIAssistant';

interface FieldConfig {
  id: string;
  label: string;
  type: string;
  instructions: string;
}

const formFields: FieldConfig[] = [
  {
    id: 'name',
    label: 'Full Name',
    type: 'text',
    instructions: 'Please enter your full legal name as it appears on official documents.'
  },
  {
    id: 'bio',
    label: 'Professional Bio',
    type: 'textarea',
    instructions: 'Write a brief professional biography highlighting your key achievements and expertise.'
  },
  {
    id: 'skills',
    label: 'Skills',
    type: 'text',
    instructions: 'List your primary technical and professional skills, separated by commas.'
  }
];

export default function FormWithAssistant() {
  const [activeField, setActiveField] = useState<FieldConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const handleFieldFocus = (field: FieldConfig) => {
    setActiveField(field);
    setIsAssistantOpen(true);
  };

  const handleFieldChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-1/2 p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Professional Profile</h1>
        <form className="space-y-6">
          {formFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-600 bg-white text-gray-900"
                  rows={4}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  onFocus={() => handleFieldFocus(field)}
                />
              ) : (
                <input
                  type={field.type}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-600 bg-white text-gray-900"
                  value={formData[field.id] || ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  onFocus={() => handleFieldFocus(field)}
                />
              )}
            </div>
          ))}
        </form>
      </div>

      <AIAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        activeField={activeField}
        currentValue={activeField ? formData[activeField.id] || '' : ''}
        onSuggestionSelect={(suggestion) => {
          if (activeField) {
            handleFieldChange(activeField.id, suggestion);
          }
        }}
      />
    </div>
  );
}
