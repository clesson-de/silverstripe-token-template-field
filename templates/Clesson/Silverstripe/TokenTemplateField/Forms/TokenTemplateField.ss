<div id="$ID"
     class="token-template-field__wrapper $extraClass"
     data-available-tokens="$AvailableTokensJSON"
     data-field-name="$Name"
     data-value="$Value"
     data-show-free-text="$ShowFreeTextAttr"
     data-colorful="$ColorfulAttr"
     data-readonly="<% if $isReadonly %>1<% else %>0<% end_if %>"
     data-disabled="<% if $isDisabled %>1<% else %>0<% end_if %>">
  <input type="hidden" name="$Name" value="$Value" class="token-template-field__input"<% if $isDisabled %> disabled="disabled"<% end_if %> />
</div>

