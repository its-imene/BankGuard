import React, { useState, useEffect } from 'react';
import { X, Server, Globe, Lock, FileJson, Settings, Plus, ChevronRight, Shield, Copy, RefreshCw, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function AddDestinationModal({ isOpen, onClose, onSave, target = null }) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    format: 'JSON',
    description: '',
    secretKey: '',
    isActive: true,
    mapping: {},
    eventTypes: ['BATCH_VALIDATED']
  });

  const [showSecretKey, setShowSecretKey] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [mapSearch, setMapSearch] = useState('');

  const availableFields = [
    'fullName', 'name1', 'name2', 'name3', 'name4', 'name5', 'name6',
    'title', 'nameNonLatin', 'dob', 'townOfBirth', 'countryOfBirth', 
    'nationality', 'passportNum', 'nationalId', 'addr1', 'addr2', 
    'addr3', 'city', 'state', 'zipCode', 'country', 'otherInfo', 
    'groupType', 'groupId', 'listedOn', 'lastUpdated'
  ];

  const formats = [
    { id: 'JSON', label: 'JSON', icon: '{}', desc: 'REST API payload' },
    { id: 'XML', label: 'XML', icon: '<>', desc: 'ISO format' },
    { id: 'EXCEL', label: 'Excel', icon: '⊞', desc: 'Spreadsheet' },
    { id: 'HMT', label: 'HM Treasury', icon: '🇬🇧', desc: 'UK schema' },
    { id: 'CUSTOM', label: 'Custom', icon: '⚙', desc: 'Field mapping' },
    { id: 'FILE_STORAGE', label: 'Cloud Storage', icon: '☁', desc: 'Drive/S3 (Soon)', disabled: true },
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'System name is required';
    }
    
    if (!formData.url.trim()) {
      newErrors.url = 'Endpoint URL is required';
    } else if (!/^https?:\/\/.+/.test(formData.url)) {
      newErrors.url = 'Must be a valid HTTP/HTTPS URL';
    }

    if (formData.format === 'CUSTOM' && Object.keys(formData.mapping).length === 0) {
      newErrors.mapping = 'Add at least one field mapping for custom format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (target) {
      setFormData({
        ...target,
        mapping: target.mapping || {}
      });
    } else {
      setFormData({
        name: '',
        url: '',
        format: 'JSON',
        description: '',
        secretKey: generateSecretKey(),
        isActive: true,
        mapping: {},
        eventTypes: ['BATCH_VALIDATED']
      });
    }
    setErrors({});
    setTouched({});
  }, [target, isOpen]);

  const generateSecretKey = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const copySecretKey = () => {
    navigator.clipboard.writeText(formData.secretKey);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const addMapping = () => {
    const newKey = `custom_field_${Object.keys(formData.mapping).length + 1}`;
    setFormData(prev => ({
      ...prev,
      mapping: { ...prev.mapping, [newKey]: 'fullName' }
    }));
  };

  const updateMapping = (oldKey, newKey, value) => {
    const newMapping = { ...formData.mapping };
    if (oldKey !== newKey) {
      delete newMapping[oldKey];
    }
    newMapping[newKey] = value;
    setFormData(prev => ({ ...prev, mapping: newMapping }));
  };

  const removeMapping = (key) => {
    setFormData(prev => ({
      ...prev,
      mapping: Object.fromEntries(
        Object.entries(prev.mapping).filter(([k]) => k !== key)
      )
    }));
  };

  const getFieldError = (field) => {
    return touched[field] && errors[field];
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 rounded-lg">
              <Server size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {target ? 'Edit Distribution Target' : 'Add Distribution Target'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {target ? 'Update system configuration' : 'Configure a destination for automated data distribution'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Basic Info Section */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* System Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    System Name
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <Server className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                    <input 
                      required
                      value={formData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      type="text" 
                      placeholder="e.g., SWIFT Gateway, Payment Hub" 
                      className={`w-full bg-slate-50 border-2 rounded-lg pl-10 pr-4 py-3 text-sm font-medium outline-none transition-all ${
                        getFieldError('name')
                          ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                          : 'border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                      }`}
                    />
                  </div>
                  {getFieldError('name') && (
                    <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                      <AlertCircle size={14} />
                      {errors.name}
                    </div>
                  )}
                </div>

                {/* Target URL */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    System URL / Webhook
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                    <input 
                      required
                      value={formData.url}
                      onChange={(e) => handleFieldChange('url', e.target.value)}
                      onBlur={() => handleBlur('url')}
                      type="url" 
                      placeholder="https://api.system.com/webhook" 
                      className={`w-full bg-slate-50 border-2 rounded-lg pl-10 pr-4 py-3 text-sm font-medium outline-none transition-all ${
                        getFieldError('url')
                          ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                          : 'border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                      }`}
                    />
                  </div>
                  {getFieldError('url') && (
                    <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                      <AlertCircle size={14} />
                      {errors.url}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Description (optional)
                  </label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Add notes about this destination system..."
                    rows="2"
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg px-4 py-3 text-sm font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-100 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Format Selection */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data Format</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {formats.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    disabled={f.disabled}
                    onClick={() => setFormData(prev => ({ ...prev, format: f.id }))}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      formData.format === f.id 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    } ${f.disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                  >
                    <div className="text-2xl mb-2">{f.icon}</div>
                    <div className="text-xs font-bold text-slate-900">{f.label}</div>
                    {f.disabled ? (
                      <div className="text-[10px] text-orange-600 font-bold mt-1 uppercase">Coming Soon</div>
                    ) : (
                      <div className="text-[10px] text-slate-500 mt-1">{f.desc}</div>
                    )}
                    {formData.format === f.id && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Mapping Section */}
            {formData.format === 'CUSTOM' && (
              <div className="space-y-4 p-6 bg-gradient-to-br from-orange-50 to-orange-50/50 rounded-xl border-2 border-orange-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings size={16} className="text-orange-600" />
                    <h3 className="text-sm font-bold text-orange-900">Field Mapping</h3>
                  </div>
                  <button 
                    type="button"
                    onClick={addMapping}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-orange-200 rounded-lg text-orange-600 hover:bg-orange-50 font-semibold text-xs transition-all"
                  >
                    <Plus size={14} /> Add Field
                  </button>
                </div>

                {Object.entries(formData.mapping).length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <Settings size={24} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-medium">No field mappings yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(formData.mapping).map(([label, internal], idx) => (
                      <div key={idx} className="flex items-end gap-2">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-orange-900 uppercase">External Label</label>
                          <input 
                            type="text"
                            value={label}
                            onChange={(e) => updateMapping(label, e.target.value, internal)}
                            placeholder="field_name"
                            className="w-full bg-white border border-orange-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                          />
                        </div>
                        <div className="h-8 flex items-center text-slate-300 font-bold">→</div>
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-orange-900 uppercase">Internal Field</label>
                          <select 
                            value={internal}
                            onChange={(e) => updateMapping(label, label, e.target.value)}
                            className="w-full bg-white border border-orange-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-orange-500"
                          >
                            <option value="">Select field...</option>
                            {availableFields.map(field => (
                              <option key={field} value={field}>{field}</option>
                            ))}
                          </select>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeMapping(label)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {getFieldError('mapping') && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium bg-red-50 p-2 rounded-lg border border-red-200">
                    <AlertCircle size={14} />
                    {errors.mapping}
                  </div>
                )}
              </div>
            )}

            {/* Security Section */}
            <div className="space-y-4 p-6 bg-gradient-to-br from-slate-50 to-slate-50/50 rounded-xl border-2 border-slate-200">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">Security</h3>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  HMAC Shared Secret
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input 
                      value={formData.secretKey}
                      onChange={(e) => handleFieldChange('secretKey', e.target.value)}
                      type={showSecretKey ? "text" : "password"}
                      className="w-full bg-white border-2 border-slate-200 rounded-lg pl-4 pr-12 py-3 text-xs font-mono font-bold text-slate-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showSecretKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, secretKey: generateSecretKey() }))}
                    className="px-4 py-3 border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition-all text-slate-600 font-semibold text-xs"
                    title="Generate new secret key"
                  >
                    <RefreshCw size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={copySecretKey}
                    className="px-4 py-3 border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition-all text-slate-600 font-semibold text-xs"
                    title="Copy to clipboard"
                  >
                    {copiedSecret ? <CheckCircle size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  Payloads are signed with HMAC-SHA256. Share this key securely with the destination system.
                </p>
              </div>
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span className="text-sm font-semibold text-slate-700">
                  {formData.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                className={`relative w-12 h-6 rounded-full transition-all ${
                  formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  formData.isActive ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500 font-medium">
              {target ? 'Last edited' : 'New configuration'}
            </span>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2.5 rounded-lg font-semibold text-sm text-slate-700 hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-8 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                {target ? 'Update Target' : 'Create Target'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
