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

      const root = createRoot(el);
      el._reactRoot = root;

      root.render(
        <TokenTemplateField
          availableTokens={availableTokens}
          initialValue={initialValue}
          onChange={(newValue) => {
            $(el).find('input[type="hidden"]').val(newValue).trigger('change');
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

