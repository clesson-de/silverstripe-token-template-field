<?php

declare(strict_types=1);

namespace Clesson\Silverstripe\TokenTemplateField\Forms;

use SilverStripe\Forms\FormField;
use SilverStripe\View\Requirements;

/**
 * A form field that allows users to compose a template string by chaining
 * visual token pills instead of typing raw text.
 *
 * Tokens are rendered as interactive pill/segment elements. The underlying
 * value is stored as a plain string with token placeholders (e.g. {tokenKey}).
 *
 * @package Clesson\Silverstripe\TokenTemplateField
 * @subpackage Forms
 */
class TokenTemplateField extends FormField
{
    /**
     * Available tokens that can be inserted into the template.
     *
     * Each entry maps a token key to either a human-readable label (string)
     * or an array with keys "label" and optionally "color".
     *
     * @var array<string, string|array{label: string, color?: string}>
     */
    protected array $availableTokens = [];

    /**
     * Whether the free text token (ABC) button is shown.
     *
     * @var bool
     */
    protected bool $showFreeText = true;

    /**
     * Whether tokens use individual pastel colors or a uniform grey color.
     *
     * @var bool
     */
    protected bool $colorful = false;

    /**
     * @param string $name
     * @param string $title
     * @param array<string, string|array{label: string, color?: string}> $availableTokens
     * @param mixed $value
     */
    public function __construct(
        string $name,
        string $title = '',
        array $availableTokens = [],
        mixed $value = null,
    ) {
        $this->availableTokens = $availableTokens;

        parent::__construct($name, $title, $value);
    }

    /**
     * Sets the available tokens for this field.
     *
     * Each value can be either a plain string (label) or an array
     * with keys "label" and optionally "color" (CSS color value).
     *
     * @param array<string, string|array{label: string, color?: string}> $tokens
     * @return static
     */
    public function setAvailableTokens(array $tokens): static
    {
        $this->availableTokens = $tokens;

        return $this;
    }

    /**
     * Returns the available tokens for this field.
     *
     * @return array<string, string|array{label: string, color?: string}>
     */
    public function getAvailableTokens(): array
    {
        return $this->availableTokens;
    }

    /**
     * Returns the available tokens as a normalized JSON-encoded string for use in templates.
     *
     * Normalizes all entries to objects with "label" and optionally "color".
     *
     * @return string
     */
    public function getAvailableTokensJSON(): string
    {
        $normalized = [];

        foreach ($this->availableTokens as $key => $value) {
            if (is_array($value)) {
                $normalized[$key] = $value;
            } else {
                $normalized[$key] = ['label' => $value];
            }
        }

        return json_encode($normalized, JSON_UNESCAPED_UNICODE);
    }

    /**
     * Enables or disables the free text token (ABC) button.
     *
     * @param bool $show
     * @return static
     */
    public function setShowFreeText(bool $show): static
    {
        $this->showFreeText = $show;

        return $this;
    }

    /**
     * Returns whether the free text token (ABC) button is shown.
     *
     * @return bool
     */
    public function getShowFreeText(): bool
    {
        return $this->showFreeText;
    }

    /**
     * Returns "1" or "0" for use in the template data attribute.
     *
     * @return string
     */
    public function getShowFreeTextAttr(): string
    {
        return $this->showFreeText ? '1' : '0';
    }

    /**
     * Enables or disables individual pastel colors for tokens.
     *
     * When disabled, all tokens use a uniform grey color.
     *
     * @param bool $colorful
     * @return static
     */
    public function setColorful(bool $colorful): static
    {
        $this->colorful = $colorful;

        return $this;
    }

    /**
     * Returns whether tokens use individual pastel colors.
     *
     * @return bool
     */
    public function getColorful(): bool
    {
        return $this->colorful;
    }

    /**
     * Returns "1" or "0" for use in the template data attribute.
     *
     * @return string
     */
    public function getColorfulAttr(): string
    {
        return $this->colorful ? '1' : '0';
    }

    /**
     * @inheritdoc
     */
    public function Type(): string
    {
        return 'tokentemplate';
    }

    /**
     * @inheritdoc
     */
    public function getAttributes(): array
    {
        $attributes = parent::getAttributes();

        $attributes['data-available-tokens'] = $this->getAvailableTokensJSON();
        $attributes['data-value'] = $this->Value();
        $attributes['data-field-name'] = $this->getName();
        $attributes['data-show-free-text'] = $this->showFreeText ? '1' : '0';
        $attributes['data-readonly'] = $this->isReadonly() ? '1' : '0';
        $attributes['data-disabled'] = $this->isDisabled() ? '1' : '0';
        $attributes['class'] = trim(($attributes['class'] ?? '') . ' token-template-field');

        return $attributes;
    }

    /**
     * Returns a readonly representation of this field.
     *
     * @return static
     */
    public function performReadonlyTransformation(): static
    {
        $clone = clone $this;
        $clone->setReadonly(true);

        return $clone;
    }

    /**
     * Returns a disabled representation of this field.
     *
     * @return static
     */
    public function performDisabledTransformation(): static
    {
        $clone = clone $this;
        $clone->setDisabled(true);

        return $clone;
    }

    /**
     * @inheritdoc
     */
    public function Field($properties = [])
    {
        Requirements::javascript('clesson-de/silverstripe-token-template-field:client/dist/tokentemplatefield.js');
        Requirements::css('clesson-de/silverstripe-token-template-field:client/dist/tokentemplatefield.css');

        return parent::Field($properties);
    }

    /**
     * @inheritdoc
     */
    public function getSchemaDataDefaults(): array
    {
        $defaults = parent::getSchemaDataDefaults();
        $defaults['data']['availableTokens'] = $this->availableTokens;

        return $defaults;
    }

    /**
     * Parses a template string by replacing all {key} placeholders with the corresponding values.
     *
     * Example:
     *   TokenTemplateField::parse('Hello {name}!', ['name' => 'World'])
     *   // Returns: "Hello World!"
     *
     * @param string $template The template string containing {key} placeholders.
     * @param array<string, string> $values Map of token keys to their replacement values.
     * @return string The parsed string with all known placeholders replaced.
     */
    public static function parse(string $template, array $values): string
    {
        $replacements = [];

        foreach ($values as $key => $value) {
            $replacements['{' . $key . '}'] = $value;
        }

        return str_replace(array_keys($replacements), array_values($replacements), $template);
    }
}
