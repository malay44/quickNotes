import React from 'react';

interface ColorPickerProps {
  color: string;
  // for previewing the color
  onChange: (color: string) => void;
  // for saving the color in state
  onClose?: () => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  onClose,
}) => {
  return (
    <input
      type="color"
      // value={color}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onClose}
      className="w-8 h-8 border-none cursor-pointer"
    />
  );
};
