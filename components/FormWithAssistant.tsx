"use client";

import { useState } from 'react';
import AIAssistant from './AIAssistant';
import { parsePdfToText } from '../utils/pdfParser';

interface FieldConfig {
  id: string;
  label: string;
  type: string;
  instructions: string;
  options?: string[];
  suggestions?: string[];
}

const formFields: FieldConfig[] = [
  // Ilmoittajan henkilötiedot (Personal Information)
  {
    id: 'lastName',
    label: 'Sukunimi',
    type: 'text',
    instructions: 'Kirjoita virallinen sukunimesi selkeästi.',
    suggestions: ['Meikäläinen', 'Virtanen']
  },
  {
    id: 'firstNames',
    label: 'Etunimet',
    type: 'text',
    instructions: 'Kirjoita kaikki etunimesi. Merkitse puhuttelunimi alleviivaamalla (esim. Matti_Juhani).',
    suggestions: ['Matti_Juhani', 'Anna_Maria Johanna']
  },
  {
    id: 'email',
    label: 'Sähköpostiosoite',
    type: 'email',
    instructions: 'Anna virallinen työsähköpostiosoitteesi yhteydenottoja varten.',
    suggestions: ['etunimi.sukunimi@outokummunkaupunki.fi']
  },
  {
    id: 'position',
    label: 'Luottamustehtävä tai virkatehtävä kaupungissa',
    type: 'text',
    instructions: 'Ilmoita kaikki nykyiset luottamus- ja virkatehtäväsi kaupungissa. Jos useita tehtäviä, listaa kaikki.',
    suggestions: [
      'Kaupunginhallituksen jäsen',
      'Tarkastuslautakunnan jäsen',
      'Teknisen lautakunnan puheenjohtaja'
    ]
  },
  // Sidonnaisuudet (Interests)
  {
    id: 'managementPositions',
    label: '1. Johtotehtävät elinkeinotoimintaa harjoittavissa yrityksissä ja muissa yhteisöissä',
    type: 'textarea',
    instructions: 'Ilmoita kaikki johtotehtävät yrityksissä ja yhteisöissä. Mainitse organisaation nimi, tehtävä ja toimikausi. Ilmoita myös mahdolliset konserniin kuuluvat muut yhteisöt.',
    suggestions: [
      'Yritys Oy, hallituksen puheenjohtaja 2020-\nYhteisö ry, hallituksen jäsen 2019-',
      'Ei ilmoitettavaa'
    ]
  },
  {
    id: 'trusteePositions',
    label: '2. Luottamustehtävät elinkeinotoimintaa harjoittavissa yrityksissä ja muissa yhteisöissä',
    type: 'textarea',
    instructions: 'Ilmoita kaikki luottamustehtävät kuten hallintoneuvostojen ja hallitusten jäsenyydet. Mainitse organisaation nimi, tehtävä ja toimikausi.',
    suggestions: [
      'Säätiö sr, valtuuskunnan jäsen 2021-\nOsuuskunta osk, hallintoneuvoston jäsen 2020-',
      'Ei ilmoitettavaa'
    ]
  },
  {
    id: 'significantAssets',
    label: '3. Merkittävä varallisuus',
    type: 'textarea',
    instructions: 'Ilmoita liike- tai sijoitustoimintaa varten hankittu omaisuus ja omistusosuudet, jotka antavat yli 20 prosentin äänivallan. Mainitse yhteisön nimi, Y-tunnus ja omistusosuus prosentteina.',
    suggestions: [
      'Kiinteistö Oy, Y-tunnus 1234567-8, omistusosuus 25%\nSijoitusyhtiö Oy, Y-tunnus 2345678-9, omistusosuus 30%',
      'Ei ilmoitettavaa'
    ]
  },
  {
    id: 'otherInterests',
    label: '4. Muut sidonnaisuudet',
    type: 'textarea',
    instructions: 'Ilmoita muut sidonnaisuudet, jotka voivat vaikuttaa luottamus- tai virkatehtävien hoitamiseen. Esimerkiksi merkittävät kiinteistöomistukset kunnan alueella tai merkittävät osakeomistukset yrityksissä, jotka toimivat kunnan alueella tai tekevät yhteistyötä kunnan kanssa.',
    suggestions: [
      'Merkittävä kiinteistöomistus kunnan alueella\nYhdistyksen hallituksen jäsenyys, jolla yhteistyötä kunnan kanssa',
      'Ei ilmoitettavaa'
    ]
  },
  {
    id: 'date',
    label: 'Päivämäärä',
    type: 'date',
    instructions: 'Valitse ilmoituksen antamispäivämäärä.',
    suggestions: [new Date().toISOString().split('T')[0]]
  }
];

export default function FormWithAssistant() {
  const [activeField, setActiveField] = useState<FieldConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, string | boolean>>({});
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const handleFieldFocus = (field: FieldConfig) => {
    setActiveField(field);
    setIsAssistantOpen(true);
  };

  const handleFieldChange = (id: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSuggestionSelect = (suggestion: string) => {
    if (activeField) {
      handleFieldChange(activeField.id, suggestion);
    }
  };

  async function handlePdfUpload(file: File) {
    try {
      const buffer = await file.arrayBuffer();
      const text = await parsePdfToText(Buffer.from(buffer));
      // Use the parsed text...
      console.log(text);
    } catch (error) {
      console.error('Error handling PDF upload:', error);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-full p-8">
        <div className="mb-8">
          <img src="/outokumpu-logo.png" alt="Outokumpu" className="h-12 mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Sidonnaisuusilmoitus tarkastuslautakunnalle</h1>
          <p className="text-sm text-gray-600 mb-4">
            Kuntalain 84 §:n mukaan kunnan luottamushenkilön ja viranhaltijan on tehtävä sidonnaisuusilmoitus johtotehtävistään sekä luottamustoimistaan elinkeinotoimintaa harjoittavissa yrityksissä ja muissa yhteisöissä, merkittävästä varallisuudestaan sekä muista sidonnaisuuksista, joilla voi olla merkitystä luottamus- ja virkatehtävien hoitamisessa.
          </p>
        </div>

        <form className="space-y-6">
          <div className="border p-4 rounded-lg bg-white">
            <h2 className="text-xl font-semibold mb-4">Ilmoittajan henkilötiedot</h2>
            {formFields.slice(0, 4).map((field) => (
              <div key={field.id} className="space-y-2 mb-4">
                <label className="block text-sm font-medium text-gray-900">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-600 bg-white text-gray-900"
                  value={formData[field.id] as string || ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  onFocus={() => handleFieldFocus(field)}
                />
                <p className="text-sm text-gray-500">{field.instructions}</p>
              </div>
            ))}
          </div>

          <div className="border p-4 rounded-lg bg-white">
            <h2 className="text-xl font-semibold mb-4">Sidonnaisuudet</h2>
            <p className="text-sm text-gray-600 mb-4">(käytä tarvittaessa lomakkeen kääntöpuolta)</p>
            {formFields.slice(4, -1).map((field) => (
              <div key={field.id} className="space-y-2 mb-6">
                <label className="block text-sm font-medium text-gray-900">
                  {field.label}
                </label>
                <textarea
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-600 bg-white text-gray-900"
                  rows={4}
                  value={formData[field.id] as string || ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  onFocus={() => handleFieldFocus(field)}
                />
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id={`${field.id}-none`}
                    checked={!formData[field.id]}
                    onChange={(e) => handleFieldChange(field.id, e.target.checked ? '' : 'Ei ilmoitettavaa')}
                    className="mr-2"
                  />
                  <label htmlFor={`${field.id}-none`} className="text-sm text-gray-600">
                    Ei ilmoitettavaa
                  </label>
                </div>
                <p className="text-sm text-gray-500">{field.instructions}</p>
              </div>
            ))}
          </div>

          <div className="border p-4 rounded-lg bg-white">
            <h2 className="text-xl font-semibold mb-4">Vakuutan, että antamani tiedot ovat oikeita</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">Päivämäärä</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-600 bg-white text-gray-900"
                  value={formData['date'] as string || ''}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Allekirjoitus</label>
                <div className="w-full p-2 border rounded-md bg-gray-100 text-gray-500 text-sm">
                  Allekirjoitetaan paperilla
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 mt-4">
            <p>Täytetty lomake osoitetaan tarkastuslautakunnalle ja lähetetään kaupungin osoitteeseen.</p>
            <p>Lisätietoja: tarkastuslautakunnan sihteeri Päivi Karjalainen, puh. 044 755 9211, paivi.karjalainen@outokummunkaupunki.fi</p>
            <p className="mt-2">
              Outokummun kaupunki Hovilankatu 2, PL 47, 83501 Outokumpu | kirjaamo@outokummunkaupunki.fi | www.outokummunkaupunki.fi
            </p>
          </div>
        </form>
      </div>

      <AIAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        activeField={activeField}
        currentValue={activeField ? (formData[activeField.id] as string) || '' : ''}
        onSuggestionSelect={handleSuggestionSelect}
      />
    </div>
  );
}
