import React, { useState, useEffect, useCallback, useRef } from 'react';
import Token from './Token.jsx';

let idCounter = 0;
const uid = () => `ttf-${Date.now()}-${++idCounter}`;

/**
 * Parses a template string into an array of token objects.
 * Parts matching {key} become placeholder tokens, everything else becomes text tokens.
 */
function parseValue(value) {
  if (!value) return [];

  const parts = value.split(/(\{[^}]+\})/);
  return parts
    .filter((part) => part.length > 0)
    .map((part) => {
      const match = part.match(/^\{(.+)\}$/);
      if (match) {
        return { type: 'placeholder', value: match[1], id: uid() };
      }
      return { type: 'text', value: part, id: uid() };
    });
}

/**
 * Serializes an array of token objects back into a template string.
 */
function serialize(tokens) {
  return tokens
    .map((t) => (t.type === 'placeholder' ? `{${t.value}}` : t.value))
    .join('');
}

export default function TokenTemplateField({ availableTokens, initialValue, onChange }) {
  const [tokens, setTokens] = useState(() => parseValue(initialValue));
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [dragState, setDragState] = useState(null);
  const [controlsOpen, setControlsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Notify parent on token changes
  useEffect(() => {
    onChange(serialize(tokens));
  }, [tokens]);

  // Click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSelectedTokenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard delete/backspace
  const handleKeyDown = useCallback(
    (e) => {
      if (!selectedTokenId) return;

      // Don't fire when focus is inside a text input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        setTokens((prev) => prev.filter((t) => t.id !== selectedTokenId));
        setSelectedTokenId(null);
      }
    },
    [selectedTokenId]
  );

  // Add a free text token (opens in edit mode immediately)
  const handleAddText = useCallback(() => {
    const newToken = { type: 'text', value: '', id: uid(), _autoEdit: true };
    setTokens((prev) => [...prev, newToken]);
  }, []);

  // Edit a text token's value
  const handleEditToken = useCallback((id, newValue) => {
    setTokens((prev) =>
      prev.map((t) => (t.id === id ? { ...t, value: newValue, _autoEdit: false } : t))
    );
  }, []);

  // Add a placeholder token
  const handleAddPlaceholder = useCallback((key) => {
    setTokens((prev) => [...prev, { type: 'placeholder', value: key, id: uid() }]);
  }, []);

  // Remove a token
  const handleRemove = useCallback((id) => {
    setTokens((prev) => prev.filter((t) => t.id !== id));
    setSelectedTokenId(null);
  }, []);

  // Select a token
  const handleSelect = useCallback((id) => {
    setSelectedTokenId(id);
  }, []);

  // Drag & Drop handlers
  const handleDragStart = useCallback((id) => {
    setDragState({ draggedId: id, overId: null });
  }, []);

  const handleDragOver = useCallback(
    (e, id) => {
      e.preventDefault();
      if (dragState && dragState.draggedId !== id) {
        setDragState((prev) => ({ ...prev, overId: id }));
      }
    },
    [dragState]
  );

  const handleDrop = useCallback(
    (e, targetId) => {
      e.preventDefault();
      if (!dragState) return;

      const { draggedId } = dragState;
      if (draggedId === targetId) {
        setDragState(null);
        return;
      }

      setTokens((prev) => {
        const draggedIndex = prev.findIndex((t) => t.id === draggedId);
        const targetIndex = prev.findIndex((t) => t.id === targetId);
        if (draggedIndex === -1 || targetIndex === -1) return prev;

        const newTokens = [...prev];
        const [moved] = newTokens.splice(draggedIndex, 1);
        newTokens.splice(targetIndex, 0, moved);
        return newTokens;
      });

      setDragState(null);
    },
    [dragState]
  );

  const handleDragEnd = useCallback(() => {
    setDragState(null);
  }, []);

  // Resolve label for a token
  const getLabel = (token) => {
    if (token.type === 'text') return token.value;
    const entry = availableTokens[token.value];
    if (!entry) return token.value;
    return typeof entry === 'string' ? entry : entry.label || token.value;
  };

  // Resolve display label for an available token entry
  const getEntryLabel = (entry) => {
    return typeof entry === 'string' ? entry : entry.label || '';
  };

  return (
    <div className="token-template-field" ref={wrapperRef} onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="token-template-field__token-list">
        {tokens.map((token) => (
          <Token
            key={token.id}
            token={token}
            label={getLabel(token)}
            isSelected={selectedTokenId === token.id}
            isDragging={dragState?.draggedId === token.id}
            isDropTarget={dragState?.overId === token.id}
            onSelect={() => handleSelect(token.id)}
            onRemove={() => handleRemove(token.id)}
            onEdit={(newValue) => handleEditToken(token.id, newValue)}
            onDragStart={() => handleDragStart(token.id)}
            onDragOver={(e) => handleDragOver(e, token.id)}
            onDrop={(e) => handleDrop(e, token.id)}
            onDragEnd={handleDragEnd}
          />
        ))}

        <button
          type="button"
          className={`token-template-field__toggle-btn${controlsOpen ? ' token-template-field__toggle-btn--open' : ''}`}
          onClick={() => setControlsOpen((prev) => !prev)}
          aria-label="Toggle token controls"
        >
          <svg width="14" height="14" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      <div className={`token-template-field__controls${controlsOpen ? '' : ' token-template-field__controls--hidden'}`}>
        <button
          type="button"
          className="token-template-field__available-token-btn token-template-field__available-token-btn--abc"
          onClick={handleAddText}
        >
          ABC
        </button>

        <div className="token-template-field__token-selector">
          {Object.entries(availableTokens).map(([key, entry]) => (
            <button
              key={key}
              type="button"
              className="token-template-field__available-token-btn"
              onClick={() => handleAddPlaceholder(key)}
            >
              {getEntryLabel(entry)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

