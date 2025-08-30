/**
 * Brand Color Palette Selector Component
 * Allows users to input custom HEX codes for brand colors with validation and preview
 * Following the lessons learned from manual video generation process
 */

import React, { useState, useCallback } from 'react';
import { CSSProperties } from 'react';
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  EFFECTS, 
  validateHexColor 
} from './DesignSystem';
import { 
  BrandColorValidator, 
  SAFE_GRADIENT_COMBINATIONS,
  BrandColorPalette 
} from './BrandColorBestPractices';

interface BrandColorSelectorProps {
  onColorsChange: (colors: BrandColorPalette) => void;
  initialColors?: string[];
  maxColors?: number;
  showPreview?: boolean;
}

interface ColorInputProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
}

interface ColorPreviewProps {
  colors: string[];
  onSelect?: (color: string) => void;
}

const ColorInput: React.FC<ColorInputProps> = ({
  value,
  onChange,
  label,
  placeholder = '#000000',
  required = false
}) => {
  const [isValid, setIsValid] = useState(true);
  const [touched, setTouched] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue) {
      const valid = validateHexColor(newValue);
      setIsValid(valid);
    } else {
      setIsValid(!required);
    }
    setTouched(true);
  }, [onChange, required]);

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: `${SPACING.sm}px ${SPACING.md}px`,
    fontSize: TYPOGRAPHY.body.fontSize,
    backgroundColor: COLORS.surface,
    border: `2px solid ${
      touched && !isValid 
        ? COLORS.error 
        : value && isValid 
        ? COLORS.success 
        : COLORS.border
    }`,
    borderRadius: EFFECTS.borderRadius.medium,
    color: COLORS.textPrimary,
    outline: 'none',
    fontFamily: 'monospace', // Better for hex codes
  };

  const colorPreviewStyle: CSSProperties = {
    width: 40,
    height: 40,
    backgroundColor: value && isValid ? value : COLORS.surface,
    border: `2px solid ${COLORS.border}`,
    borderRadius: EFFECTS.borderRadius.small,
    marginLeft: SPACING.sm,
  };

  return (
    <div style={{ marginBottom: SPACING.md }}>
      <label style={{
        fontSize: TYPOGRAPHY.caption.fontSize,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
        display: 'block',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {label} {required && '*'}
      </label>
      
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          style={inputStyle}
          maxLength={7}
        />
        <div style={colorPreviewStyle} />
      </div>
      
      {touched && !isValid && (
        <p style={{
          fontSize: TYPOGRAPHY.caption.fontSize,
          color: COLORS.error,
          marginTop: SPACING.xs,
          margin: 0,
        }}>
          Please enter a valid hex color (e.g., #FF5733)
        </p>
      )}
    </div>
  );
};

const ColorPreview: React.FC<ColorPreviewProps> = ({ colors, onSelect }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
      gap: SPACING.sm,
      padding: SPACING.md,
      backgroundColor: COLORS.surface,
      borderRadius: EFFECTS.borderRadius.medium,
      border: `1px solid ${COLORS.border}`,
    }}>
      {colors.map((color, index) => (
        <div
          key={index}
          style={{
            height: 60,
            backgroundColor: color,
            borderRadius: EFFECTS.borderRadius.small,
            cursor: onSelect ? 'pointer' : 'default',
            border: `1px solid ${COLORS.border}`,
            display: 'flex',
            alignItems: 'flex-end',
            padding: SPACING.xs,
          }}
          onClick={() => onSelect && onSelect(color)}
        >
          <span style={{
            fontSize: TYPOGRAPHY.caption.fontSize,
            color: '#fff',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            fontFamily: 'monospace',
          }}>
            {color.toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  );
};

const BrandColorSelector: React.FC<BrandColorSelectorProps> = ({
  onColorsChange,
  initialColors = [],
  maxColors = 5,
  showPreview = true
}) => {
  const [colors, setColors] = useState<string[]>([
    ...initialColors,
    ...Array(Math.max(0, maxColors - initialColors.length)).fill('')
  ]);

  const [showGradientExamples, setShowGradientExamples] = useState(false);

  const handleColorChange = useCallback((index: number, color: string) => {
    const newColors = [...colors];
    newColors[index] = color;
    setColors(newColors);

    // Filter out empty colors and validate
    const validColors = newColors.filter(c => c && validateHexColor(c));
    if (validColors.length > 0) {
      try {
        const palette = BrandColorValidator.generateColorScheme(validColors);
        onColorsChange(palette);
      } catch (error) {
        console.warn('Invalid color palette:', error);
      }
    }
  }, [colors, onColorsChange]);

  const addColorField = useCallback(() => {
    if (colors.length < maxColors) {
      setColors([...colors, '']);
    }
  }, [colors, maxColors]);

  const removeColorField = useCallback((index: number) => {
    if (colors.length > 1) {
      const newColors = colors.filter((_, i) => i !== index);
      setColors(newColors);
    }
  }, [colors]);

  const containerStyle: CSSProperties = {
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: EFFECTS.borderRadius.large,
    border: `1px solid ${COLORS.border}`,
  };

  const validColors = colors.filter(c => c && validateHexColor(c));

  return (
    <div style={containerStyle}>
      <h3 style={{
        fontSize: TYPOGRAPHY.h3.fontSize,
        color: COLORS.textPrimary,
        marginBottom: SPACING.lg,
        margin: `0 0 ${SPACING.lg}px 0`,
      }}>
        Brand Color Palette
      </h3>

      <p style={{
        fontSize: TYPOGRAPHY.bodySmall.fontSize,
        color: COLORS.textSecondary,
        marginBottom: SPACING.lg,
        lineHeight: 1.5,
      }}>
        Enter your brand colors as hex codes. The first color will be your primary brand color,
        followed by secondary and accent colors. Follow best practices to avoid ugly gradients.
      </p>

      {colors.map((color, index) => (
        <div key={index} style={{ position: 'relative' }}>
          <ColorInput
            value={color}
            onChange={(newColor) => handleColorChange(index, newColor)}
            label={
              index === 0 ? 'Primary Color' :
              index === 1 ? 'Secondary Color' :
              `Accent Color ${index - 1}`
            }
            placeholder="#FF5733"
            required={index === 0}
          />
          
          {colors.length > 1 && index > 0 && (
            <button
              onClick={() => removeColorField(index)}
              style={{
                position: 'absolute',
                top: 20,
                right: -10,
                background: COLORS.error,
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 24,
                height: 24,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              ×
            </button>
          )}
        </div>
      ))}

      {colors.length < maxColors && (
        <button
          onClick={addColorField}
          style={{
            padding: `${SPACING.sm}px ${SPACING.md}px`,
            backgroundColor: 'transparent',
            border: `2px dashed ${COLORS.border}`,
            borderRadius: EFFECTS.borderRadius.medium,
            color: COLORS.textSecondary,
            cursor: 'pointer',
            width: '100%',
            fontSize: TYPOGRAPHY.body.fontSize,
          }}
        >
          + Add Another Color
        </button>
      )}

      {validColors.length > 0 && showPreview && (
        <div style={{ marginTop: SPACING.lg }}>
          <h4 style={{
            fontSize: TYPOGRAPHY.bodyLarge.fontSize,
            color: COLORS.textPrimary,
            marginBottom: SPACING.md,
          }}>
            Color Palette Preview
          </h4>
          <ColorPreview colors={validColors} />
        </div>
      )}

      {/* Gradient Examples Toggle */}
      <div style={{ marginTop: SPACING.lg }}>
        <button
          onClick={() => setShowGradientExamples(!showGradientExamples)}
          style={{
            padding: `${SPACING.sm}px 0`,
            background: 'none',
            border: 'none',
            color: COLORS.primary,
            cursor: 'pointer',
            fontSize: TYPOGRAPHY.body.fontSize,
            textDecoration: 'underline',
          }}
        >
          {showGradientExamples ? 'Hide' : 'Show'} Safe Gradient Examples
        </button>

        {showGradientExamples && (
          <div style={{ marginTop: SPACING.md }}>
            {Object.entries(SAFE_GRADIENT_COMBINATIONS).map(([key, combination]) => (
              <div key={key} style={{ marginBottom: SPACING.md }}>
                <h5 style={{
                  fontSize: TYPOGRAPHY.caption.fontSize,
                  color: COLORS.textSecondary,
                  marginBottom: SPACING.xs,
                  textTransform: 'capitalize',
                }}>
                  {combination.description}
                </h5>
                <ColorPreview 
                  colors={combination.example} 
                  onSelect={(color) => {
                    // Add clicked color to palette
                    const emptyIndex = colors.findIndex(c => !c);
                    if (emptyIndex !== -1) {
                      handleColorChange(emptyIndex, color);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Best Practices Tips */}
      <div style={{
        marginTop: SPACING.lg,
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: EFFECTS.borderRadius.medium,
        border: `1px solid ${COLORS.border}`,
      }}>
        <h4 style={{
          fontSize: TYPOGRAPHY.bodyLarge.fontSize,
          color: COLORS.textPrimary,
          marginBottom: SPACING.sm,
        }}>
          💡 Best Practices Tips
        </h4>
        <ul style={{
          fontSize: TYPOGRAPHY.bodySmall.fontSize,
          color: COLORS.textSecondary,
          margin: 0,
          paddingLeft: SPACING.md,
          lineHeight: 1.5,
        }}>
          <li>Use your primary brand color for main elements and key messages</li>
          <li>Limit your palette to 2-3 main colors to avoid visual chaos</li>
          <li>Ensure sufficient contrast between text and background colors</li>
          <li>Test your colors on different backgrounds and screen types</li>
          <li>Consider accessibility - avoid red/green combinations for important info</li>
        </ul>
      </div>
    </div>
  );
};

export default BrandColorSelector;