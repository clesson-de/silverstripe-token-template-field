import React, { useState, useRef, useEffect } from 'react';

export default function Token({
  token,
  label,
  locked = false,
  colorful = false,
  colorIndex = -1,
  isSelected,
  isDragging,
  isDropTarget,
  onSelect,
  onRemove,
  onEdit,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) {
  const [editing, setEditing] = useState(token._autoEdit || false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const typeClass = `token-template-field__token--${token.type}`;
  const colorClass = token.type === 'placeholder'
    ? (colorful && colorIndex >= 0
      ? `token-template-field__token--color-${colorIndex}`
      : 'token-template-field__token--mono')
    : '';
  const selectedClass = isSelected ? 'token-template-field__token--selected' : '';
  const draggingClass = isDragging ? 'token-template-field__token--dragging' : '';
  const dropTargetClass = isDropTarget ? 'token-template-field__token--droptarget' : '';

  const className = [
    'token-template-field__token',
    typeClass,
    colorClass,
    selectedClass,
    draggingClass,
    dropTargetClass,
  ]
    .filter(Boolean)
    .join(' ');

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    onRemove();
  };

  const handleDoubleClick = (e) => {
    if (locked) return;
    if (token.type === 'text') {
      e.stopPropagation();
      setEditing(true);
    }
  };

  const commitEdit = (value) => {
    setEditing(false);
    if (value.length === 0) {
      onRemove();
    } else {
      onEdit(value);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit(e.target.value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditing(false);
      if (!token.value || token.value.length === 0) {
        onRemove();
      }
    }
  };

  const handleInputBlur = (e) => {
    commitEdit(e.target.value);
  };

  if (editing) {
    return (
      <span className={className}>
        <input
          ref={inputRef}
          type="text"
          className="token-template-field__token-edit-input"
          defaultValue={token.value || ''}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
        />
      </span>
    );
  }

  return (
    <span
      className={className}
      draggable={!locked}
      onClick={locked ? undefined : onSelect}
      onDoubleClick={handleDoubleClick}
      onDragStart={locked ? undefined : (e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(e);
      }}
      onDragOver={locked ? undefined : onDragOver}
      onDrop={locked ? undefined : onDrop}
      onDragEnd={locked ? undefined : onDragEnd}
    >
      <span className="token-template-field__token-label">{label}</span>
      {!locked && (
        <button
          type="button"
          className="token-template-field__token-remove"
          onClick={handleRemoveClick}
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
}
