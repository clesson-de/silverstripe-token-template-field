import React from 'react';
import { createRoot } from 'react-dom/client';
import TokenTemplateField from './TokenTemplateField.jsx';
import './TokenTemplateField.scss';

const $ = window.jQuery;

$.entwine('ss', function ($) {
  $('.token-template-field__wrapper').entwine({
    onadd() {
      const el = this[0];
      const availableTokens = JSON.parse(el.dataset.availableTokens || '{}');
      const initialValue = el.dataset.value || '';
      const isReadonly = el.dataset.readonly === '1';
      const isDisabled = el.dataset.disabled === '1';
      const showFreeText = el.dataset.showFreeText !== '0';
      const colorful = el.dataset.colorful === '1';
      const hiddenInput = el.querySelector('input[type="hidden"]');

      // Create a dedicated container for React so the hidden input is preserved
      const reactContainer = document.createElement('div');
      reactContainer.className = 'token-template-field__react-root';
      el.appendChild(reactContainer);

      const root = createRoot(reactContainer);
      el._reactRoot = root;

      root.render(
        <TokenTemplateField
          availableTokens={availableTokens}
          initialValue={initialValue}
          readonly={isReadonly}
          disabled={isDisabled}
          showFreeText={showFreeText}
          colorful={colorful}
          onChange={(newValue) => {
            if (hiddenInput) {
              hiddenInput.value = newValue;
              $(hiddenInput).trigger('change');
            }
            el.dataset.value = newValue;
          }}
        />
      );
    },
    onremove() {
      const el = this[0];
      if (el._reactRoot) {
        el._reactRoot.unmount();
      }
    }
  });
});

