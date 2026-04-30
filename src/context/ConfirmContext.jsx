import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmModal from '../components/common/ConfirmModal';

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
  const [modalConfig, setModalConfig] = useState(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setModalConfig({
        ...options,
        onConfirm: () => resolve(true),
        onClose: () => {
          setModalConfig(null);
          resolve(false);
        }
      });
    });
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {modalConfig && (
        <ConfirmModal
          isOpen={!!modalConfig}
          onClose={modalConfig.onClose}
          onConfirm={modalConfig.onConfirm}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmText={modalConfig.confirmText}
          cancelText={modalConfig.cancelText}
          type={modalConfig.type}
        />
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};
