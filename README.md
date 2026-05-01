# Silverstripe Token Template Field

A Silverstripe CMS form field that allows users to compose template strings by chaining visual token pills instead of typing raw text.

## Overview

This module provides `TokenTemplateField`, a custom form field for the Silverstripe CMS. Instead of manually typing placeholder syntax, users build template strings by selecting and arranging visual token segments (pills). The underlying value is stored as a plain string with curly-brace placeholders (e.g. `{RecipientName}`).

## Features

- Visual pill/segment-based token composition
- Configurable list of available tokens per field instance
- Drag & drop reordering of tokens (native HTML5, no external library)
- Inline editing of free text tokens (click to edit, Enter or blur to confirm)
- Collapsible token selector with chevron toggle
- Individual pastel colors per token or uniform grey mode
- Per-token custom color support via `color` option
- Optional free text tokens (ABC button) — can be disabled
- Readonly and disabled states
- Keyboard support: Delete/Backspace to remove selected tokens
- Stores a plain text value with curly-brace-delimited placeholders
- No external JS dependencies — built with vanilla JS and jQuery Entwine

## Requirements

- PHP ^8.1
- Silverstripe Framework ^6
- Silverstripe Admin ^3

## Installation

```bash
composer require clesson-de/silverstripe-token-template-field
```

After installation, expose frontend assets and rebuild the database:

```bash
composer vendor-expose
vendor/bin/sake dev/build flush=all
```

## Usage

### Basic usage

```php
use Clesson\Silverstripe\TokenTemplateField\Forms\TokenTemplateField;

$field = TokenTemplateField::create(
    'EmailSubject',
    'Email subject',
    [
        'RecipientName'  => 'Recipient name',
        'BillingMonth'   => 'Billing month',
        'BillingYear'    => 'Billing year',
        'OperationCount' => 'Number of operations',
    ]
);
```

The field stores its value as a plain string, e.g.:

```
Billing for {RecipientName} – {BillingMonth} {BillingYear}
```

### Tokens with custom colors

Each token value can be either a plain string (label) or an array with `label` and optionally `color`:

```php
$field = TokenTemplateField::create(
    'EmailSubject',
    'Email subject',
    [
        'RecipientName' => ['label' => 'Recipient name', 'color' => '#fde68a'],
        'BillingMonth'  => ['label' => 'Billing month', 'color' => '#bbf7d0'],
        'BillingYear'   => 'Billing year', // uses pastel palette or mono
    ]
);
```

### Disable free text tokens

By default, users can add free text tokens via the ABC button. To restrict the field to predefined tokens only:

```php
$field->setShowFreeText(false);
```

### Colorful mode

By default, all tokens use a uniform grey background. To enable individual pastel colors per token:

```php
$field->setColorful(true);
```

> **Note:** Tokens with an explicit `color` value always use their custom color, regardless of the `colorful` setting.

### Readonly / Disabled

The field supports Silverstripe's standard readonly and disabled transformations:

```php
// Readonly — tokens are displayed but cannot be modified
$field->setReadonly(true);
// or
$field->performReadonlyTransformation();

// Disabled — tokens are displayed, input is disabled
$field->setDisabled(true);
// or
$field->performDisabledTransformation();
```

In both states, tokens are rendered without remove buttons, drag handles, or the token selector.

### Parsing a template string

Use the static `parse()` method to replace `{key}` placeholders in a template string with actual values:

```php
use Clesson\Silverstripe\TokenTemplateField\Forms\TokenTemplateField;

$result = TokenTemplateField::parse(
    'Hello {firstname} {lastname}, your order {orderId} is ready!',
    [
        'firstname' => 'Max',
        'lastname'  => 'Mustermann',
        'orderId'   => '12345',
    ]
);
// → "Hello Max Mustermann, your order 12345 is ready!"
```

Placeholders that are not present in the values array remain unchanged in the output.

## API Reference

| Method | Description |
|---|---|
| `setAvailableTokens(array $tokens)` | Set the available tokens. Values can be strings or `['label' => '...', 'color' => '#...']` arrays. |
| `getAvailableTokens()` | Returns the configured tokens array. |
| `setShowFreeText(bool $show)` | Show or hide the free text (ABC) button. Default: `true`. |
| `setColorful(bool $colorful)` | Enable individual pastel colors (`true`) or uniform grey (`false`). Default: `false`. |
| `setReadonly(bool $readonly)` | Set the field to readonly mode. |
| `setDisabled(bool $disabled)` | Set the field to disabled mode. |
| `performReadonlyTransformation()` | Returns a readonly clone of the field. |
| `performDisabledTransformation()` | Returns a disabled clone of the field. |
| `static parse(string $template, array $values)` | Replaces `{key}` placeholders in a template string with the given values. |

## Stored Value Format

The field stores a plain `Varchar`-compatible string. Free text is stored as-is, predefined tokens are wrapped in curly braces:

```
Hello {firstname} {lastname}, your order {orderId} is ready!
```

## License

BSD-3-Clause — see [LICENSE](LICENSE).
